"use client";

import { useState } from "react";
import { StepShell } from "./step-shell";
import { FieldError } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { businessSegments, segmentLabels } from "@/lib/validations";
import type { BusinessSegment } from "@/types/database";

export function StepSegment({
  value,
  onBack,
  onNext,
}: {
  value: BusinessSegment | "";
  onBack: () => void;
  onNext: (segment: BusinessSegment) => void;
}) {
  const [segment, setSegment] = useState<BusinessSegment | "">(value);
  const [error, setError] = useState<string | undefined>();

  function handleNext() {
    if (!segment) {
      setError("Selecione um segmento");
      return;
    }
    setError(undefined);
    onNext(segment);
  }

  return (
    <StepShell
      title="Qual é o segmento do seu negócio?"
      description="Isso ajusta a página pública e os termos usados no painel."
      onBack={onBack}
      onNext={handleNext}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {businessSegments.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSegment(option)}
            className={cn(
              "rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
              segment === option
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-400",
            )}
          >
            {segmentLabels[option]}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </StepShell>
  );
}
