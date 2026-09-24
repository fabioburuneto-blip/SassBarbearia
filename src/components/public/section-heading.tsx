import { cn } from "@/lib/cn";
import type { PresetTokens } from "@/lib/themes/presets";

export function SectionHeading({
  eyebrow,
  title,
  tokens,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  tokens: PresetTokens;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-1",
        align === "center" && "items-center text-center",
      )}
    >
      {eyebrow && <p className={tokens.eyebrowClassName}>{eyebrow}</p>}
      <h2
        className={cn("text-2xl sm:text-3xl", tokens.headingClassName)}
        style={{ fontFamily: `var(${tokens.headingFontVar})` }}
      >
        {title}
      </h2>
    </div>
  );
}
