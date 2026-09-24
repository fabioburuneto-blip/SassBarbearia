"use client";

import { useActionState, useState } from "react";
import { updateTheme, type PersonalizationFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Label, FieldError } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  THEME_PRESETS,
  getPresetTokens,
  type ThemePreset,
} from "@/lib/themes/presets";

export function ThemePicker({
  businessName,
  initialPreset,
  initialPrimary,
  initialSecondary,
}: {
  businessName: string;
  initialPreset: ThemePreset;
  initialPrimary: string;
  initialSecondary: string;
}) {
  const [preset, setPreset] = useState<ThemePreset>(initialPreset);
  const [primary, setPrimary] = useState(initialPrimary);
  const [secondary, setSecondary] = useState(initialSecondary);
  const [state, formAction, pending] = useActionState<
    PersonalizationFormState,
    FormData
  >(updateTheme, undefined);

  const tokens = getPresetTokens(preset);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="preset" value={preset} />
      <input type="hidden" name="primary_color" value={primary} />
      <input type="hidden" name="secondary_color" value={secondary} />

      <div>
        <Label>Tema</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEME_PRESETS.map((option) => {
            const optionTokens = getPresetTokens(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => setPreset(option)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                  preset === option
                    ? "border-zinc-900 ring-1 ring-zinc-900"
                    : "border-zinc-300 hover:border-zinc-400",
                )}
              >
                <span className="text-sm font-semibold text-zinc-900">
                  {optionTokens.label}
                </span>
                <span className="text-xs text-zinc-500">
                  {optionTokens.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="picker-primary">Cor primária</Label>
          <input
            id="picker-primary"
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            className="h-10 w-14 rounded border border-zinc-300"
          />
        </div>
        <div>
          <Label htmlFor="picker-secondary">Cor secundária</Label>
          <input
            id="picker-secondary"
            type="color"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            className="h-10 w-14 rounded border border-zinc-300"
          />
        </div>
      </div>

      <div>
        <Label>Pré-visualização</Label>
        <div
          className={cn("overflow-hidden border", tokens.pageBackground)}
          style={{ borderRadius: tokens.radius }}
        >
          <div
            className="flex flex-col items-start gap-2 p-6"
            style={
              tokens.darkHero
                ? { backgroundColor: primary, color: "white" }
                : {}
            }
          >
            <span
              className={tokens.eyebrowClassName}
              style={{ color: tokens.darkHero ? "white" : secondary }}
            >
              Prévia
            </span>
            <span
              className={cn("text-xl", tokens.headingClassName)}
              style={{ fontFamily: `var(${tokens.headingFontVar})` }}
            >
              {businessName || "Sua empresa"}
            </span>
            <span
              className={tokens.buttonClassName}
              style={{
                backgroundColor: tokens.darkHero ? "white" : primary,
                color: tokens.darkHero ? primary : "white",
                display: "inline-block",
              }}
            >
              Agendar horário
            </span>
          </div>
          <div className={cn("flex gap-3 p-4", tokens.pageText)}>
            <span className={cn("flex-1 p-3 text-xs", tokens.cardClassName)}>
              Cartão de exemplo
            </span>
            <span className={cn("flex-1 p-3 text-xs", tokens.cardClassName)}>
              Cartão de exemplo
            </span>
          </div>
        </div>
      </div>

      <FieldError message={state?.error} />
      {state?.success && (
        <p className="text-sm text-emerald-600">Tema salvo.</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Salvar tema"}
      </Button>
    </form>
  );
}
