import { Fragment, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { getPresetTokens } from "@/lib/themes/presets";
import type { SectionKey } from "@/lib/themes/sections";
import { HeroSection } from "./sections/hero-section";
import { AboutSection } from "./sections/about-section";
import { ServicesSection } from "./sections/services-section";
import { TeamSection } from "./sections/team-section";
import { GallerySection } from "./sections/gallery-section";
import { BookingCTA } from "./sections/booking-cta";
import { LocationSection } from "./sections/location-section";
import { SocialSection } from "./sections/social-section";
import { FooterSection } from "./sections/footer-section";
import type { PublicPageData } from "./types";

/**
 * The single engine every business's public page runs through: reads the
 * theme's preset (design tokens) and ordered section list, then dispatches
 * each enabled section, in order, to the one shared component for that
 * block. Nothing here is business-specific -- all variation comes from
 * `data` and the preset tokens.
 */
export function ThemeRenderer({
  business,
  theme,
  services,
  professionals,
  servicesByProfessional,
  previewMode,
}: PublicPageData) {
  const tokens = getPresetTokens(theme.preset);

  const renderers: Record<SectionKey, () => React.ReactNode> = {
    hero: () => <HeroSection business={business} tokens={tokens} />,
    about: () => <AboutSection business={business} tokens={tokens} />,
    services: () => <ServicesSection services={services} tokens={tokens} />,
    team: () => <TeamSection professionals={professionals} tokens={tokens} />,
    gallery: () => (
      <GallerySection
        images={theme.gallery_urls}
        businessName={business.name}
        tokens={tokens}
      />
    ),
    booking: () => (
      <BookingCTA
        business={business}
        services={services}
        professionals={professionals}
        servicesByProfessional={servicesByProfessional}
        tokens={tokens}
        previewMode={previewMode}
      />
    ),
    location: () => <LocationSection business={business} tokens={tokens} />,
    social: () => <SocialSection business={business} tokens={tokens} />,
    footer: () => <FooterSection business={business} tokens={tokens} />,
  };

  const brandVars = {
    "--brand-primary": theme.primary_color,
    "--brand-secondary": theme.secondary_color,
  } as CSSProperties;

  return (
    <div
      className={cn("flex-1", tokens.pageBackground, tokens.pageText)}
      style={{ ...brandVars, fontFamily: `var(${tokens.bodyFontVar})` }}
    >
      {theme.sections
        .filter((section) => section.enabled)
        .map((section) => (
          <Fragment key={section.key}>{renderers[section.key]()}</Fragment>
        ))}
    </div>
  );
}
