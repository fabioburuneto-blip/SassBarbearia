"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusiness, requireOwner } from "@/lib/auth";
import {
  personalizationSchema,
  themeSchema,
  businessImageSchema,
} from "@/lib/validations";
import { normalizeSections, type SectionConfig } from "@/lib/themes/sections";

export type PersonalizationFormState =
  { error?: string; success?: boolean } | undefined;

function revalidatePublicPage(slug: string) {
  revalidatePath("/dashboard/personalizacao");
  revalidatePath("/preview");
  revalidatePath(`/${slug}`);
}

export async function updatePersonalizationInfo(
  _prevState: PersonalizationFormState,
  formData: FormData,
): Promise<PersonalizationFormState> {
  const parsed = personalizationSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    whatsapp: formData.get("whatsapp"),
    instagram: formData.get("instagram"),
    city: formData.get("city"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { supabase, business, role } = await getCurrentBusiness();
  requireOwner(role);

  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      whatsapp: parsed.data.whatsapp || null,
      instagram: parsed.data.instagram || null,
      city: parsed.data.city || null,
      address: parsed.data.address || null,
    })
    .eq("id", business.id);

  if (error) {
    return { error: "Não foi possível salvar as informações." };
  }

  revalidatePublicPage(business.slug);
  return { success: true };
}

export async function updateTheme(
  _prevState: PersonalizationFormState,
  formData: FormData,
): Promise<PersonalizationFormState> {
  const parsed = themeSchema.safeParse({
    primary_color: formData.get("primary_color"),
    secondary_color: formData.get("secondary_color"),
    preset: formData.get("preset"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { supabase, business, role } = await getCurrentBusiness();
  requireOwner(role);

  const { error } = await supabase
    .from("themes")
    .update(parsed.data)
    .eq("business_id", business.id);

  if (error) {
    return { error: "Não foi possível salvar o tema." };
  }

  revalidatePublicPage(business.slug);
  return { success: true };
}

/**
 * Persists the public URL of an already-uploaded logo/cover image (see
 * ImageUploader) -- never receives the file itself, only a URL already
 * scoped to this business's storage folder by the bucket's RLS policies.
 */
export async function updateBusinessImage(
  kind: "logo" | "cover",
  url: string,
): Promise<PersonalizationFormState> {
  const parsed = businessImageSchema.safeParse({ kind, url });
  if (!parsed.success) {
    return { error: "URL de imagem inválida." };
  }

  const { supabase, business, role } = await getCurrentBusiness();
  requireOwner(role);

  const { error } = await supabase
    .from("businesses")
    .update(
      parsed.data.kind === "logo"
        ? { logo_url: parsed.data.url }
        : { cover_url: parsed.data.url },
    )
    .eq("id", business.id);

  if (error) {
    return { error: "Não foi possível salvar a imagem." };
  }

  revalidatePublicPage(business.slug);
  return { success: true };
}

const MAX_GALLERY_IMAGES = 12;

export async function addGalleryImage(
  url: string,
): Promise<PersonalizationFormState> {
  const parsed = businessImageSchema.safeParse({ kind: "gallery", url });
  if (!parsed.success) {
    return { error: "URL de imagem inválida." };
  }

  const { supabase, business, role } = await getCurrentBusiness();
  requireOwner(role);

  const { data: theme } = await supabase
    .from("themes")
    .select("gallery_urls")
    .eq("business_id", business.id)
    .single();

  const current = theme?.gallery_urls ?? [];
  if (current.length >= MAX_GALLERY_IMAGES) {
    return { error: `Máximo de ${MAX_GALLERY_IMAGES} fotos na galeria.` };
  }

  const { error } = await supabase
    .from("themes")
    .update({ gallery_urls: [...current, parsed.data.url] })
    .eq("business_id", business.id);

  if (error) {
    return { error: "Não foi possível adicionar a foto." };
  }

  revalidatePublicPage(business.slug);
  return { success: true };
}

export async function removeGalleryImage(
  url: string,
): Promise<PersonalizationFormState> {
  const { supabase, business, role } = await getCurrentBusiness();
  requireOwner(role);

  const { data: theme } = await supabase
    .from("themes")
    .select("gallery_urls")
    .eq("business_id", business.id)
    .single();

  const next = (theme?.gallery_urls ?? []).filter((u) => u !== url);

  const { error } = await supabase
    .from("themes")
    .update({ gallery_urls: next })
    .eq("business_id", business.id);

  if (error) {
    return { error: "Não foi possível remover a foto." };
  }

  revalidatePublicPage(business.slug);
  return { success: true };
}

/**
 * Persists the whole section list at once (visibility + order) after a
 * toggle or a move in the dashboard editor. Re-normalizes server-side
 * instead of trusting the client's array as-is -- it must still cover
 * every known section exactly once.
 */
export async function updateSections(
  sections: SectionConfig[],
): Promise<PersonalizationFormState> {
  const { supabase, business, role } = await getCurrentBusiness();
  requireOwner(role);

  const normalized = normalizeSections(sections);

  const { error } = await supabase
    .from("themes")
    .update({ sections: normalized })
    .eq("business_id", business.id);

  if (error) {
    return { error: "Não foi possível salvar a ordem das seções." };
  }

  revalidatePublicPage(business.slug);
  return { success: true };
}
