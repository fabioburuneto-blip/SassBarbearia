import { SectionHeading } from "../section-heading";
import { whatsappLink } from "@/lib/whatsapp";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicBusiness } from "../types";

export function SocialSection({
  business,
  tokens,
}: {
  business: PublicBusiness;
  tokens: PresetTokens;
}) {
  if (!business.instagram && !business.whatsapp) return null;

  return (
    <section className={tokens.sectionPadding + " px-4 text-center sm:px-8"}>
      <div className="mx-auto max-w-xl">
        <SectionHeading
          eyebrow="Redes sociais"
          title="Fale com a gente"
          tokens={tokens}
          align="center"
        />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {business.whatsapp && (
            <a
              href={whatsappLink(
                business.whatsapp,
                `Olá! Vim pela página do ${business.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={tokens.buttonClassName}
              style={{
                backgroundColor: `var(${tokens.bodyAccentVar})`,
                color: "white",
              }}
            >
              WhatsApp
            </a>
          )}
          {business.instagram && (
            <a
              href={`https://instagram.com/${business.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className={tokens.buttonClassName}
              style={{
                borderWidth: 1,
                borderColor: `var(${tokens.bodyAccentVar})`,
                color: `var(${tokens.bodyAccentVar})`,
              }}
            >
              @{business.instagram}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
