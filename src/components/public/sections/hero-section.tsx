import Image from "next/image";
import { cn } from "@/lib/cn";
import { segmentLabels } from "@/lib/validations";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicBusiness } from "../types";

function Logo({ business, size }: { business: PublicBusiness; size: number }) {
  if (business.logo_url) {
    return (
      <Image
        src={business.logo_url}
        alt={business.name}
        width={size}
        height={size}
        unoptimized
        className="rounded-2xl border-2 border-white/80 bg-white object-cover shadow-lg"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-2xl border-2 border-white/80 text-2xl font-semibold text-white shadow-lg"
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--brand-primary)",
      }}
    >
      {business.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function HeroSection({
  business,
  tokens,
}: {
  business: PublicBusiness;
  tokens: PresetTokens;
}) {
  const eyebrow = segmentLabels[business.segment];
  const heading = (
    <h1
      className={cn("text-4xl sm:text-5xl", tokens.headingClassName)}
      style={{ fontFamily: `var(${tokens.headingFontVar})` }}
    >
      {business.name}
    </h1>
  );

  if (tokens.heroVariant === "minimal") {
    return (
      <section className={cn(tokens.sectionPadding, "px-4")}>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Logo business={business} size={64} />
          <p className={tokens.eyebrowClassName}>{eyebrow}</p>
          {heading}
          {business.description && (
            <p className="max-w-lg text-base opacity-70">
              {business.description}
            </p>
          )}
          <BookingLink />
        </div>
      </section>
    );
  }

  if (tokens.heroVariant === "centered") {
    return (
      <section
        className={cn(tokens.sectionPadding, "px-4 text-center")}
        style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <Logo business={business} size={72} />
          <p className={tokens.eyebrowClassName}>{eyebrow}</p>
          {heading}
          {business.description && (
            <p className="max-w-lg text-base opacity-90">
              {business.description}
            </p>
          )}
          <BookingLink inverted />
        </div>
      </section>
    );
  }

  if (tokens.heroVariant === "split") {
    return (
      <section className="grid gap-8 px-4 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
        <div className="flex flex-col items-start gap-4">
          <Logo business={business} size={64} />
          <p className={tokens.eyebrowClassName}>{eyebrow}</p>
          {heading}
          {business.description && (
            <p className="max-w-md text-base opacity-70">
              {business.description}
            </p>
          )}
          <BookingLink />
        </div>
        <div
          className="aspect-[4/3] w-full bg-zinc-200 lg:aspect-auto lg:h-full lg:min-h-80"
          style={{
            borderRadius: tokens.radius,
            ...(business.cover_url
              ? {
                  backgroundImage: `url(${business.cover_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { backgroundColor: "var(--brand-secondary)" }),
          }}
        />
      </section>
    );
  }

  // fullbleed
  return (
    <section
      className="relative flex min-h-[26rem] w-full items-end sm:min-h-[32rem]"
      style={{
        backgroundColor: "var(--brand-primary)",
        ...(business.cover_url
          ? {
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25)), url(${business.cover_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
      }}
    >
      <div className="w-full px-4 py-10 text-white sm:px-8 sm:py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4">
          <Logo business={business} size={72} />
          <p className={tokens.eyebrowClassName}>{eyebrow}</p>
          {heading}
          {business.description && (
            <p className="max-w-lg text-base opacity-90">
              {business.description}
            </p>
          )}
          <BookingLink inverted />
        </div>
      </div>
    </section>
  );
}

function BookingLink({ inverted }: { inverted?: boolean }) {
  return (
    <a
      href="#agendamento"
      className={cn(
        "mt-2 inline-flex items-center justify-center text-sm transition-opacity hover:opacity-90",
      )}
      style={
        inverted
          ? { backgroundColor: "white", color: "var(--brand-primary)" }
          : { backgroundColor: "var(--brand-primary)", color: "white" }
      }
    >
      <span className="rounded-full px-6 py-3 font-semibold">
        Agendar horário
      </span>
    </a>
  );
}
