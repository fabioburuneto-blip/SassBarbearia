import { cn } from "@/lib/cn";
import { formatPriceCents } from "@/lib/format";
import { SectionHeading } from "../section-heading";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicService } from "../types";

export function ServicesSection({
  services,
  tokens,
}: {
  services: PublicService[];
  tokens: PresetTokens;
}) {
  if (services.length === 0) return null;

  return (
    <section className={tokens.sectionPadding + " px-4 sm:px-8"}>
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Serviços"
          title="O que oferecemos"
          tokens={tokens}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className={cn("p-5", tokens.cardClassName)}>
              <h3
                className={cn("text-lg", tokens.headingClassName)}
                style={{ fontFamily: `var(${tokens.headingFontVar})` }}
              >
                {service.name}
              </h3>
              {service.description && (
                <p className="mt-1 text-sm opacity-70">{service.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="opacity-60">
                  {service.duration_minutes} min
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--brand-secondary)" }}
                >
                  {formatPriceCents(service.price_cents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
