import { SectionHeading } from "../section-heading";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicBusiness } from "../types";

export function AboutSection({
  business,
  tokens,
}: {
  business: PublicBusiness;
  tokens: PresetTokens;
}) {
  if (!business.description) return null;

  return (
    <section className={tokens.sectionPadding + " px-4 sm:px-8"}>
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="Sobre"
          title={`Conheça ${business.name}`}
          tokens={tokens}
        />
        <p className="text-base leading-relaxed opacity-80">
          {business.description}
        </p>
      </div>
    </section>
  );
}
