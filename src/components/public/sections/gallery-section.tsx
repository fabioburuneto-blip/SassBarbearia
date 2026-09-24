import Image from "next/image";
import { SectionHeading } from "../section-heading";
import type { PresetTokens } from "@/lib/themes/presets";

export function GallerySection({
  images,
  businessName,
  tokens,
}: {
  images: string[];
  businessName: string;
  tokens: PresetTokens;
}) {
  if (images.length === 0) return null;

  return (
    <section className={tokens.sectionPadding + " px-4 sm:px-8"}>
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Galeria"
          title="Nosso espaço"
          tokens={tokens}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden bg-zinc-100"
              style={{ borderRadius: tokens.radius }}
            >
              <Image
                src={url}
                alt={`${businessName} - foto ${index + 1}`}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
