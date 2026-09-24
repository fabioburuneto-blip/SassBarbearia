import { publicPageFontClassName } from "@/lib/themes/fonts";
import { ThemeRenderer } from "./theme-renderer";
import type { PublicPageData } from "./types";

/**
 * Top-level entry point for a rendered business page. Used by both the
 * real public route (`/[slug]`) and the authenticated preview
 * (`/preview`) -- same component, same data shape, so the
 * preview is never a guess at what will go live.
 */
export function PublicPage(data: PublicPageData) {
  return (
    <div className={publicPageFontClassName}>
      {data.previewMode && (
        <div className="sticky top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-950">
          Modo de prévia — visível só para você. Ninguém mais vê isso até a
          página ser publicada.
        </div>
      )}
      <ThemeRenderer {...data} />
    </div>
  );
}
