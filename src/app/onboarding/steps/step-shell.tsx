import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Shared header + footer chrome for every onboarding step. */
export function StepShell({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled,
  nextPending,
  skip,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextPending?: boolean;
  skip?: { label: string; onSkip: () => void };
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}

      <div className="mt-6">{children}</div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <div>
          {onBack && (
            <Button type="button" variant="ghost" onClick={onBack}>
              Voltar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {skip && (
            <button
              type="button"
              onClick={skip.onSkip}
              className="text-sm text-zinc-500 hover:text-zinc-700 hover:underline"
            >
              {skip.label}
            </button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || nextPending}
          >
            {nextPending ? "Salvando..." : nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
