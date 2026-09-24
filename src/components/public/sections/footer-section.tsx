import { cn } from "@/lib/cn";
import type { PresetTokens } from "@/lib/themes/presets";
import type { PublicBusiness } from "../types";

export function FooterSection({
  business,
  tokens,
}: {
  business: PublicBusiness;
  tokens: PresetTokens;
}) {
  return (
    <footer
      className={cn(
        "border-t px-4 py-8 text-center text-sm opacity-60 sm:px-8",
        tokens.key === "barber" ? "border-zinc-800" : "border-zinc-200",
      )}
    >
      <p>
        © {new Date().getFullYear()} {business.name}
      </p>
      <p className="mt-1 text-xs">Agenda online por Aureon Agenda</p>
    </footer>
  );
}
