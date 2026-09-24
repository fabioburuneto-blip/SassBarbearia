import { SectionHeading } from "../section-heading";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicBusiness } from "../types";

export function LocationSection({
  business,
  tokens,
}: {
  business: PublicBusiness;
  tokens: PresetTokens;
}) {
  if (!business.city && !business.address) return null;

  const query = [business.address, business.city].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className={tokens.sectionPadding + " px-4 sm:px-8"}>
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="Localização"
          title="Onde estamos"
          tokens={tokens}
        />
        <div className={"p-5 " + tokens.cardClassName}>
          {business.address && <p className="text-sm">{business.address}</p>}
          {business.city && (
            <p className="text-sm opacity-70">{business.city}</p>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium underline"
            style={{ color: "var(--brand-secondary)" }}
          >
            Ver no mapa
          </a>
        </div>
      </div>
    </section>
  );
}
