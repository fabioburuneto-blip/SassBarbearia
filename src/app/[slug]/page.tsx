import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildPublicPageData } from "@/lib/public-page-data";
import { PublicPage } from "@/components/public/public-page";
import type { PublicBusiness, PublicPageData } from "@/components/public/types";
import type { Metadata } from "next";

const PUBLIC_BUSINESS_COLUMNS =
  "name, slug, segment, description, whatsapp, instagram, city, address, timezone, logo_url, cover_url";

async function getPublicPageData(slug: string): Promise<PublicPageData | null> {
  const supabase = await createClient();

  // id is fetched separately (never returned to callers) purely to scope
  // the queries below -- PublicPageData never carries it. `.returns<>()`
  // pins the TS type to exactly this column list (our hand-written
  // Database type doesn't parse select strings, so without it TS would
  // believe every business column -- owner_id, email, phone, is_published
  // -- is still present here).
  const { data: businessRow } = await supabase
    .from("businesses")
    .select(`id, ${PUBLIC_BUSINESS_COLUMNS}`)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()
    .returns<({ id: string } & PublicBusiness) | null>();

  if (!businessRow) return null;
  const { id: businessId, ...business } = businessRow;

  return buildPublicPageData(supabase, businessId, business);
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getPublicPageData(slug);
  if (!data) return {};

  const { business } = data;
  const description =
    business.description ??
    `Agende um horário com ${business.name} em poucos cliques.`;
  const ogImage = business.cover_url ?? business.logo_url ?? undefined;

  return {
    title: business.name,
    description,
    openGraph: {
      title: business.name,
      description,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: business.name,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function BusinessPublicPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const data = await getPublicPageData(slug);

  if (!data) notFound();

  return <PublicPage {...data} />;
}
