-- =========================================================================
-- Onboarding wizard support: contact/location fields collected during
-- business creation, and a lightweight slug-availability check the wizard
-- can call while the user is still typing (before create_business()).
-- =========================================================================
alter table public.businesses
  add column whatsapp text,
  add column instagram text,
  add column city text,
  add column address text;

-- SECURITY DEFINER: an available slug has no business row yet, so a plain
-- client-side select (scoped by RLS to published/own businesses) can't
-- reliably tell "no row" apart from "row exists but I can't see it". This
-- checks existence directly, bypassing RLS, and returns only a boolean.
create or replace function public.is_slug_available(p_slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (select 1 from public.businesses where slug = p_slug);
$$;

grant execute on function public.is_slug_available(text) to anon, authenticated;

-- Extend create_business() with the optional onboarding fields. The old
-- 4-arg overload is dropped first: CREATE OR REPLACE only replaces a
-- function with the exact same parameter *types*, so simply adding
-- trailing params here would leave both signatures installed, and a call
-- passing only the original 4 named args would then be ambiguous between
-- them (the new params all have defaults).
drop function if exists public.create_business(text, text, text, text);

create or replace function public.create_business(
  p_name text,
  p_slug text,
  p_segment text,
  p_timezone text default 'America/Sao_Paulo',
  p_whatsapp text default null,
  p_instagram text default null,
  p_city text default null,
  p_address text default null
) returns public.businesses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required' using errcode = '22023';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) < 3 then
    raise exception 'invalid slug format' using errcode = '22023';
  end if;

  if p_slug in (
    'login', 'signup', 'criar-conta', 'dashboard', 'onboarding', 'auth',
    'api', 'admin', 'public', 'assets', 'static'
  ) then
    raise exception 'slug is reserved' using errcode = '22023';
  end if;

  if p_segment not in (
    'barbershop', 'hair_salon', 'nails', 'aesthetics',
    'tattoo', 'massage', 'personal_trainer', 'other'
  ) then
    raise exception 'invalid segment' using errcode = '22023';
  end if;

  insert into public.businesses (
    owner_id, name, slug, segment, timezone, whatsapp, instagram, city, address
  )
  values (
    auth.uid(), trim(p_name), p_slug, p_segment, coalesce(p_timezone, 'America/Sao_Paulo'),
    nullif(trim(coalesce(p_whatsapp, '')), ''),
    nullif(trim(coalesce(p_instagram, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_address, '')), '')
  )
  returning * into v_business;

  insert into public.business_members (business_id, user_id, role)
  values (v_business.id, auth.uid(), 'owner');

  insert into public.business_settings (business_id) values (v_business.id);
  insert into public.themes (business_id) values (v_business.id);
  insert into public.subscriptions (business_id) values (v_business.id);

  return v_business;
end;
$$;

grant execute on function public.create_business(text, text, text, text, text, text, text, text) to authenticated;
