/**
 * Every font used by any preset, imported once with next/font/google so
 * they're self-hosted and subset at build time. next/font requires static,
 * module-scope calls -- it can't take a runtime preset value -- so all
 * presets' fonts load together as CSS variables, and each preset (see
 * presets.ts) just points at the variable it wants via Tailwind's
 * `font-[family-name:var(--font-x)]` arbitrary-value syntax. Only the latin
 * subset and the weights actually used are fetched, so this stays cheap
 * despite covering five distinct looks.
 */
import {
  Playfair_Display,
  Space_Grotesk,
  Work_Sans,
  Bebas_Neue,
  Oswald,
  Cormorant_Garamond,
  Inter,
} from "next/font/google";

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-premium-heading",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-modern-heading",
});

export const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-minimal",
});

export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-barber-heading",
});

export const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-barber-body",
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-elegant-heading",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

/** Applied once on the public page's root wrapper. */
export const publicPageFontClassName = [
  playfairDisplay.variable,
  spaceGrotesk.variable,
  workSans.variable,
  bebasNeue.variable,
  oswald.variable,
  cormorantGaramond.variable,
  inter.variable,
].join(" ");
