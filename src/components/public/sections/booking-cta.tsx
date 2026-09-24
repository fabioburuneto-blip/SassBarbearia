import { BookingWidget } from "@/app/[slug]/booking-widget";
import { SectionHeading } from "../section-heading";
import type { PresetTokens } from "@/lib/themes/presets";
import type {
  PublicBusiness,
  PublicProfessional,
  PublicService,
} from "../types";

export function BookingCTA({
  business,
  services,
  professionals,
  servicesByProfessional,
  tokens,
  previewMode,
}: {
  business: PublicBusiness;
  services: PublicService[];
  professionals: PublicProfessional[];
  servicesByProfessional: Map<string, string[]>;
  tokens: PresetTokens;
  previewMode?: boolean;
}) {
  return (
    <section
      id="agendamento"
      className={tokens.sectionPadding + " px-4 sm:px-8"}
    >
      <div className="mx-auto max-w-md">
        <SectionHeading
          eyebrow="Agendamento"
          title="Marque seu horário"
          tokens={tokens}
          align="center"
        />
        <BookingWidget
          businessSlug={business.slug}
          timezone={business.timezone}
          services={services}
          professionals={professionals}
          servicesByProfessional={servicesByProfessional}
          primaryColor="var(--brand-primary)"
          previewMode={previewMode}
        />
      </div>
    </section>
  );
}
