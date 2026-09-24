-- =========================================================================
-- Public page rendering engine: replaces the old free-text `font` +
-- two-value `layout` with a fixed set of design presets (applied by a
-- single ThemeRenderer component on the app side), plus a data-driven,
-- reorderable list of sections and a small image gallery.
-- =========================================================================
alter table public.themes
  drop column font,
  drop column layout;

alter table public.themes
  add column preset text not null default 'modern'
    check (preset in ('premium', 'modern', 'minimal', 'barber', 'elegant')),
  add column sections jsonb not null default '[
    {"key": "hero", "enabled": true},
    {"key": "about", "enabled": true},
    {"key": "services", "enabled": true},
    {"key": "team", "enabled": true},
    {"key": "gallery", "enabled": true},
    {"key": "booking", "enabled": true},
    {"key": "location", "enabled": true},
    {"key": "social", "enabled": true},
    {"key": "footer", "enabled": true}
  ]'::jsonb,
  add column gallery_urls text[] not null default '{}';
