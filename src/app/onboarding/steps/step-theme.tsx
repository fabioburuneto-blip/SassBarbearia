"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  updateTheme,
  type CustomizationFormState,
} from "@/app/dashboard/customization/actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { ThemeLayout } from "@/types/database";

const PRESETS = [
  {
    label: "Clássico",
    primary: "#111827",
    secondary: "#6366f1",
    layout: "classic" as ThemeLayout,
  },
  {
    label: "Elegante",
    primary: "#1c1917",
    secondary: "#b45309",
    layout: "classic" as ThemeLayout,
  },
  {
    label: "Moderno",
    primary: "#0f172a",
    secondary: "#2563eb",
    layout: "minimal" as ThemeLayout,
  },
  {
    label: "Vibrante",
    primary: "#4c1d95",
    secondary: "#db2777",
    layout: "minimal" as ThemeLayout,
  },
  {
    label: "Natureza",
    primary: "#14532d",
    secondary: "#16a34a",
    layout: "classic" as ThemeLayout,
  },
];

export function StepTheme({
  onBack,
  onNext,
}: {
  onBack?: () => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const [state, formAction, pending] = useActionState<
    CustomizationFormState,
    FormData
  >(updateTheme, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state?.success) {
      onNext();
    }
    wasPending.current = pending;
  }, [pending, state, onNext]);

  const preset = PRESETS[selected];

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">
        Escolha um tema inicial
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Define as cores da sua página pública. Você pode personalizar tudo
        depois.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRESETS.map((p, index) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setSelected(index)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
              selected === index
                ? "border-zinc-900 ring-1 ring-zinc-900"
                : "border-zinc-300 hover:border-zinc-400",
            )}
          >
            <div className="flex gap-1">
              <span
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: p.primary }}
              />
              <span
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: p.secondary }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-700">{p.label}</span>
          </button>
        ))}
      </div>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="primary_color" value={preset.primary} />
        <input type="hidden" name="secondary_color" value={preset.secondary} />
        <input type="hidden" name="layout" value={preset.layout} />
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
