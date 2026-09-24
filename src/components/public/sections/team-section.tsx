import Image from "next/image";
import { cn } from "@/lib/cn";
import { SectionHeading } from "../section-heading";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicProfessional } from "../types";

export function TeamSection({
  professionals,
  tokens,
}: {
  professionals: PublicProfessional[];
  tokens: PresetTokens;
}) {
  if (professionals.length === 0) return null;

  return (
    <section className={tokens.sectionPadding + " px-4 sm:px-8"}>
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Equipe"
          title="Quem vai te atender"
          tokens={tokens}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className={cn(
                "flex flex-col items-center gap-3 p-5 text-center",
                tokens.cardClassName,
              )}
            >
              {professional.avatar_url ? (
                <Image
                  src={professional.avatar_url}
                  alt={professional.name}
                  width={72}
                  height={72}
                  unoptimized
                  className="h-[4.5rem] w-[4.5rem] rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-xl font-semibold text-white"
                  style={{ backgroundColor: `var(${tokens.bodyAccentVar})` }}
                >
                  {professional.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{professional.name}</p>
                {professional.bio && (
                  <p className="mt-1 text-xs opacity-60">{professional.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
