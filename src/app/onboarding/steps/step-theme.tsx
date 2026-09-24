"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  updateTheme,
  type PersonalizationFormState,
} from "@/app/dashboard/personalizacao/actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  THEME_PRESETS,
  getPresetTokens,
  type ThemePreset,
} from "@/lib/themes/presets";

/** Suggested starting colors per preset -- the owner can fine-tune both in
 * /dashboard/personalizacao afterwards; this is just a sensible default so
 * onboarding doesn't force a color-picking decision on day one. */
const DEFAULT_COLORS: Record<
  ThemePreset,
  { primary: string; secondary: string }
> = {
  premium: { primary: "#111111", secondary: "#c8a96b" },
  modern: { primary: "#0f172a", secondary: "#2563eb" },
  minimal: { primary: "#18181b", secondary: "#71717a" },
  barber: { primary: "#0a0a0a", secondary: "#b45309" },
  elegant: { primary: "#4c1d95", secondary: "#db2777" },
};

export function StepTheme({
  onBack,
  onNext,
}: {
  onBack?: () => void;
  onNext: () => void;
}) {
  const [preset, setPreset] = useState<ThemePreset>("modern");
  const [state, formAction, pending] = useActionState<
    PersonalizationFormState,
    FormData
  >(updateTheme, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state?.success) {
      onNext();
    }
    wasPending.current = pending;
  }, [pending, state, onNext]);

  const colors = DEFAULT_COLORS[preset];

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">
        Escolha um tema inicial
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Define o visual da sua página pública. Você pode trocar tudo depois em
        Personalização.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEME_PRESETS.map((option) => {
          const tokens = getPresetTokens(option);
          const optionColors = DEFAULT_COLORS[option];
          return (
            <button
              key={option}
              type="button"
              onClick={() => setPreset(option)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                preset === option
                  ? "border-zinc-900 ring-1 ring-zinc-900"
                  : "border-zinc-300 hover:border-zinc-400",
              )}
            >
              <div className="flex gap-1">
                <span
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: optionColors.primary }}
                />
                <span
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: optionColors.secondary }}
                />
              </div>
              <span className="text-xs font-medium text-zinc-700">
                {tokens.label}
              </span>
            </button>
          );
        })}
      </div>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="preset" value={preset} />
        <input type="hidden" name="primary_color" value={colors.primary} />
        <input type="hidden" name="secondary_color" value={colors.secondary} />
        <FieldError message={state?.error} />
        <div className="mt-4 flex items-center justify-between">
          {onBack ? (
            <Button type="button" variant="ghost" onClick={onBack}>
              Voltar
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Usar este tema"}
          </Button>
        </div>
      </form>
    </div>
  );
}
