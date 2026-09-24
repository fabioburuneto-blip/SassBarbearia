import { getCurrentBusiness } from "@/lib/auth";
import { buildPublicPageData } from "@/lib/public-page-data";
import { PublicPage } from "@/components/public/public-page";
import type { PublicBusiness } from "@/components/public/types";

/**
 * Authenticated, realistic preview of the owner's own public page --
 * deliberately NOT nested under /dashboard (that layout adds the sidebar
 * chrome, which the real page never has) and not gated by `is_published`,
 * so it works while still configuring a page that isn't live yet. Reuses
 * the exact same PublicPage/ThemeRenderer engine as `/[slug]`, so what you
 * see here is what goes live -- never a separate mockup that can drift.
 */
export default async function PreviewPage() {
  const { supabase, business } = await getCurrentBusiness();

  const publicBusiness: PublicBusiness = {
    name: business.name,
    slug: business.slug,
    segment: business.segment,
    description: business.description,
    whatsapp: business.whatsapp,
    instagram: business.instagram,
    city: business.city,
    address: business.address,
    timezone: business.timezone,
    logo_url: business.logo_url,
    cover_url: business.cover_url,
  };

  const data = await buildPublicPageData(supabase, business.id, publicBusiness);

  return <PublicPage {...data} previewMode />;
}
