/**
 * Design tokens for each theme preset. Every public page runs through the
 * exact same components (see src/components/public); presets only change
 * which Tailwind classes / font variables those components read off this
 * object -- never a different template per business. Colors are NOT part
 * of a preset: `primary_color`/`secondary_color` are set independently per
 * business (see ThemeRenderer) and layered on top via CSS variables.
 */

export const THEME_PRESETS = [
  "premium",
  "modern",
  "minimal",
  "barber",
  "elegant",
] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number];

export type HeroVariant = "fullbleed" | "split" | "centered" | "minimal";

export type PresetTokens = {
  key: ThemePreset;
  label: string;
  description: string;
  /** CSS variable name (defined in fonts.ts) used for headings/body. */
  headingFontVar: string;
  bodyFontVar: string;
  headingClassName: string;
  radius: string;
  cardClassName: string;
  buttonClassName: string;
  sectionPadding: string;
  heroVariant: HeroVariant;
  darkHero: boolean;
  eyebrowClassName: string;
  pageBackground: string;
  pageText: string;
  /** CSS var to use for solid accent fills rendered on the page body
   * (avatar placeholders, the WhatsApp button, etc) -- as opposed to the
   * hero, which always sits on its own background and can use
   * `--brand-primary` directly. Presets whose page background is itself
   * dark (barber) point this at `--brand-secondary` instead, since a dark
   * chosen primary color would otherwise vanish against a dark page. */
  bodyAccentVar: string;
};

export const PRESET_TOKENS: Record<ThemePreset, PresetTokens> = {
  premium: {
    key: "premium",
    label: "Premium",
    description: "Elegante e sofisticado, com capa em tela cheia.",
    headingFontVar: "--font-premium-heading",
    bodyFontVar: "--font-body",
    headingClassName: "font-semibold tracking-tight",
    radius: "1rem",
    cardClassName: "rounded-2xl border border-zinc-200 bg-white shadow-md",
    buttonClassName: "rounded-full px-6 py-3 font-medium tracking-wide",
    sectionPadding: "py-16 sm:py-24",
    heroVariant: "fullbleed",
    darkHero: true,
    eyebrowClassName:
      "text-xs font-semibold tracking-[0.2em] uppercase opacity-80",
    pageBackground: "bg-white",
    pageText: "text-zinc-900",
    bodyAccentVar: "--brand-primary",
  },
  modern: {
    key: "modern",
    label: "Moderno",
    description: "Limpo e direto, com capa dividida texto/imagem.",
    headingFontVar: "--font-modern-heading",
    bodyFontVar: "--font-body",
    headingClassName: "font-bold tracking-tight",
    radius: "1.25rem",
    cardClassName: "rounded-2xl border border-zinc-200 bg-white",
    buttonClassName: "rounded-full px-6 py-3 font-semibold",
    sectionPadding: "py-14 sm:py-20",
    heroVariant: "split",
    darkHero: false,
    eyebrowClassName:
      "text-xs font-semibold tracking-widest uppercase text-[var(--brand-secondary)]",
    pageBackground: "bg-white",
    pageText: "text-zinc-900",
    bodyAccentVar: "--brand-primary",
  },
  minimal: {
    key: "minimal",
    label: "Minimalista",
    description: "Bastante espaço em branco, sem elementos supérfluos.",
    headingFontVar: "--font-minimal",
    bodyFontVar: "--font-minimal",
    headingClassName: "font-semibold tracking-tight",
    radius: "0.5rem",
    cardClassName: "rounded-md border border-zinc-200 bg-white",
    buttonClassName: "rounded-md px-5 py-2.5 font-medium",
    sectionPadding: "py-12 sm:py-16",
    heroVariant: "minimal",
    darkHero: false,
    eyebrowClassName:
      "text-xs font-medium tracking-wide uppercase text-zinc-500",
    pageBackground: "bg-white",
    pageText: "text-zinc-900",
    bodyAccentVar: "--brand-primary",
  },
  barber: {
    key: "barber",
    label: "Barbearia",
    description: "Visual escuro e forte, tipografia impactante.",
    headingFontVar: "--font-barber-heading",
    bodyFontVar: "--font-barber-body",
    headingClassName: "font-normal tracking-wide uppercase",
    radius: "0.25rem",
    cardClassName: "rounded-sm border border-zinc-800 bg-zinc-900",
    buttonClassName: "rounded-sm px-6 py-3 font-medium tracking-wide uppercase",
    sectionPadding: "py-14 sm:py-20",
    heroVariant: "fullbleed",
    darkHero: true,
    eyebrowClassName:
      "text-xs font-medium tracking-[0.25em] uppercase text-[var(--brand-secondary)]",
    pageBackground: "bg-zinc-950",
    pageText: "text-zinc-100",
    bodyAccentVar: "--brand-secondary",
  },
  elegant: {
    key: "elegant",
    label: "Elegante",
    description: "Suave e sofisticado, ideal para salões e estética.",
    headingFontVar: "--font-elegant-heading",
    bodyFontVar: "--font-body",
    headingClassName: "font-medium tracking-tight",
    radius: "1.5rem",
    cardClassName: "rounded-3xl border border-zinc-100 bg-zinc-50",
    buttonClassName: "rounded-full px-6 py-3 font-medium",
    sectionPadding: "py-16 sm:py-24",
    heroVariant: "split",
    darkHero: false,
    eyebrowClassName:
      "text-xs font-medium tracking-[0.2em] uppercase text-[var(--brand-secondary)]",
    pageBackground: "bg-white",
    pageText: "text-zinc-900",
    bodyAccentVar: "--brand-primary",
  },
};

export function getPresetTokens(preset: string): PresetTokens {
  return PRESET_TOKENS[preset as ThemePreset] ?? PRESET_TOKENS.modern;
}
