"use client";

import { OptionalTextStep } from "./optional-text-step";
import { onboardingInstagramSchema } from "@/lib/validations";

export function StepInstagram({
  value,
  onBack,
  onNext,
}: {
  value: string;
  onBack: () => void;
  onNext: (instagram: string) => void;
}) {
  return (
    <OptionalTextStep
      title="Instagram da empresa?"
      description="Aparece na sua página pública, se preenchido."
      fieldLabel="Instagram"
      placeholder="usuario"
      prefix="@"
      value={value}
      schema={onboardingInstagramSchema}
      fieldName="instagram"
      onBack={onBack}
      onNext={onNext}
    />
  );
}
