"use client";

import { useState } from "react";
import { StepShell } from "./step-shell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { onboardingNameSchema } from "@/lib/validations";

export function StepName({
  value,
  onNext,
}: {
  value: string;
  onNext: (name: string) => void;
}) {
  const [name, setName] = useState(value);
  const [error, setError] = useState<string | undefined>();

  function handleNext() {
    const parsed = onboardingNameSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    onNext(parsed.data.name);
  }

  return (
    <StepShell
      title="Como se chama sua empresa?"
      description="É o nome que seus clientes vão ver."
      onNext={handleNext}
    >
      <Label htmlFor="ob-name">Nome da empresa</Label>
      <Input
        id="ob-name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleNext()}
        placeholder="Barbearia do Fábio"
      />
      <FieldError message={error} />
    </StepShell>
  );
}
