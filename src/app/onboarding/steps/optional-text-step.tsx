"use client";

import { useState } from "react";
import type { ZodType } from "zod";
import { StepShell } from "./step-shell";
import { Input, Label, FieldError } from "@/components/ui/input";

/** Shared shell for the single optional-text-field steps (WhatsApp, Instagram). */
export function OptionalTextStep({
  title,
  description,
  fieldLabel,
  placeholder,
  prefix,
  value,
  schema,
  fieldName,
  onBack,
  onNext,
}: {
  title: string;
  description?: string;
  fieldLabel: string;
  placeholder?: string;
  prefix?: string;
  value: string;
  schema: ZodType<Record<string, string | undefined>>;
  fieldName: string;
  onBack: () => void;
  onNext: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | undefined>();

  function handleNext() {
    const parsed = schema.safeParse({ [fieldName]: text });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    onNext((parsed.data[fieldName] as string | undefined) ?? "");
  }

  return (
    <StepShell
      title={title}
      description={description}
      onBack={onBack}
      onNext={handleNext}
      skip={{ label: "Pular por agora", onSkip: () => onNext("") }}
    >
      <Label htmlFor="ob-optional-field">{fieldLabel}</Label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-zinc-500">{prefix}</span>}
        <Input
          id="ob-optional-field"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          placeholder={placeholder}
        />
      </div>
      <FieldError message={error} />
    </StepShell>
  );
}
