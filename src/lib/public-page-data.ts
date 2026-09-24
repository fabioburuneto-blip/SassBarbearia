import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeSections } from "@/lib/themes/sections";
import type { Database } from "@/types/database";
import type { PublicBusiness, PublicPageData } from "@/components/public/types";

/**
 * Shared by the real public route (`/[slug]`, business already narrowed to
 * public-safe columns and filtered to is_published) and the authenticated
 * preview (`/preview`, business is the owner's full row, not
 * published-gated) -- same fetch shape either way, so preview never
 * diverges from what actually renders once the page goes live.
 */
export async function buildPublicPageData(
  supabase: SupabaseClient<Database>,
  businessId: string,
  business: PublicBusiness,
): Promise<Omit<PublicPageData, "previewMode">> {
  const [
    { data: theme },
    { data: services },
    { data: professionals },
    { data: links },
  ] = await Promise.all([
    supabase
      .from("themes")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase
      .from("services")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("position", { ascending: true }),
    supabase
      .from("professionals")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("position", { ascending: true }),
    supabase
      .from("professional_services")
      .select("professional_id, service_id"),
  ]);

  const servicesByProfessional = new Map<string, string[]>();
  for (const link of links ?? []) {
    const list = servicesByProfessional.get(link.professional_id) ?? [];
    list.push(link.service_id);
    servicesByProfessional.set(link.professional_id, list);
  }

  return {
    business,
    theme: {
      preset: (theme?.preset as PublicPageData["theme"]["preset"]) ?? "modern",
      primary_color: theme?.primary_color ?? "#111827",
      secondary_color: theme?.secondary_color ?? "#6366f1",
      sections: normalizeSections(theme?.sections),
      gallery_urls: theme?.gallery_urls ?? [],
    },
    services: services ?? [],
    professionals: professionals ?? [],
    servicesByProfessional,
  };
}
