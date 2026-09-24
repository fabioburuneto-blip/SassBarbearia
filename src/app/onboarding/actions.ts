"use server";

import { redirect } from "next/navigation";
import { createBusinessSchema } from "@/lib/validations";
import { isValidSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type CreateBusinessInput = {
  name: string;
  slug: string;
  segment: Database["public"]["Tables"]["businesses"]["Row"]["segment"];
  whatsapp?: string;
  instagram?: string;
  city?: string;
  address?: string;
};

export type CreateBusinessResult =
  | { error: string }
  | {
      error?: undefined;
      business: { id: string; name: string; slug: string };
    };

/**
 * Checks whether a slug is free to claim. Runs the public.is_slug_available
 * SECURITY DEFINER RPC so it works regardless of whether the caller could
 * otherwise see the row that already holds it (RLS would hide an
 * unpublished business, which would make a plain SELECT lie about
 * availability).
 */
export async function checkSlugAvailability(
  rawSlug: string,
): Promise<{ available: boolean; error?: string }> {
  const slug = rawSlug.trim().toLowerCase();

  if (!isValidSlug(slug)) {
    return { available: false, error: "Formato inválido" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_slug_available", {
    p_slug: slug,
  });

  if (error) {
    return { available: false, error: "Não foi possível verificar agora." };
  }

  return { available: Boolean(data) };
}

/**
 * The only path that creates a business. Called directly (not bound to a
 * <form>) because the onboarding wizard collects its fields across several
 * steps before submitting them together. Never trusts an owner id from the
 * client: create_business() derives it from the authenticated session on
 * the database side via auth.uid().
 */
export async function createBusinessAction(
  input: CreateBusinessInput,
): Promise<CreateBusinessResult> {
  const parsed = createBusinessSchema.safeParse({
    name: input.name,
    slug: input.slug,
    segment: input.segment,
    timezone: "America/Sao_Paulo",
    whatsapp: input.whatsapp,
    instagram: input.instagram,
    city: input.city,
    address: input.address,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase.rpc("create_business", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_segment: parsed.data.segment,
    p_timezone: parsed.data.timezone,
    p_whatsapp: parsed.data.whatsapp ?? null,
    p_instagram: parsed.data.instagram ?? null,
    p_city: parsed.data.city ?? null,
    p_address: parsed.data.address ?? null,
  });

  if (error || !data) {
    if (error?.code === "23505") {
      return { error: "Esse endereço já está em uso. Escolha outro." };
    }
    return { error: "Não foi possível criar sua empresa. Tente novamente." };
  }

  return { business: { id: data.id, name: data.name, slug: data.slug } };
}
