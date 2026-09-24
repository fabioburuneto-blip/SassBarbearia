import type { BusinessSegment, Database } from "@/types/database";
import type { SectionConfig } from "@/lib/themes/sections";
import type { ThemePreset } from "@/lib/themes/presets";

/**
 * Only the fields a business is allowed to show publicly. Built once in
 * the data-fetching layer (`getPublicBusinessData` in `[slug]/page.tsx`,
 * reused by the dashboard preview) and passed everywhere downstream --
 * server sections and client components alike -- so there is never a path
 * where `owner_id`, `email`, `phone`, `is_published`, or a raw row id ends
 * up serialized into the page (React Server Components inline whatever
 * object you hand a Client Component into the page payload, unused fields
 * included, so this narrowing has to happen before that handoff, not after).
 */
export type PublicBusiness = {
  name: string;
  slug: string;
  segment: BusinessSegment;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  city: string | null;
  address: string | null;
  timezone: string;
  logo_url: string | null;
  cover_url: string | null;
};

export type PublicTheme = {
  preset: ThemePreset;
  primary_color: string;
  secondary_color: string;
  sections: SectionConfig[];
  gallery_urls: string[];
};

export type PublicService = Database["public"]["Tables"]["services"]["Row"];
export type PublicProfessional =
  Database["public"]["Tables"]["professionals"]["Row"];

export type PublicPageData = {
  business: PublicBusiness;
  theme: PublicTheme;
  services: PublicService[];
  professionals: PublicProfessional[];
  servicesByProfessional: Map<string, string[]>;
  /** True only on the authenticated /preview route: same engine,
   * same data, but the booking form is inert so previewing never creates a
   * real appointment. */
  previewMode?: boolean;
};
