"use client";

import { OptionalTextStep } from "./optional-text-step";
import { onboardingWhatsappSchema } from "@/lib/validations";

export function StepWhatsapp({
  value,
  onBack,
  onNext,
}: {
  value: string;
  onBack: () => void;
  onNext: (whatsapp: string) => void;
}) {
  return (
    <OptionalTextStep
      title="Qual o WhatsApp da empresa?"
      description="Usado para clientes entrarem em contato. Você pode adicionar depois."
      fieldLabel="WhatsApp"
      placeholder="(11) 99999-9999"
      value={value}
      schema={onboardingWhatsappSchema}
      fieldName="whatsapp"
      onBack={onBack}
      onNext={onNext}
    />
  );
}
