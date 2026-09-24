"use client";

import { useState } from "react";
import { StepShell } from "./step-shell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { onboardingLocationSchema } from "@/lib/validations";

export function StepLocation({
  city,
  address,
  onBack,
  onNext,
}: {
  city: string;
  address: string;
  onBack: () => void;
  onNext: (city: string, address: string) => void;
}) {
  const [cityValue, setCityValue] = useState(city);
  const [addressValue, setAddressValue] = useState(address);
  const [error, setError] = useState<string | undefined>();

  function handleNext() {
    const parsed = onboardingLocationSchema.safeParse({
      city: cityValue,
      address: addressValue,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    onNext(parsed.data.city ?? "", parsed.data.address ?? "");
  }

  return (
    <StepShell
      title="Onde fica sua empresa?"
      description="Opcional, mas ajuda clientes a te encontrarem."
      onBack={onBack}
      onNext={handleNext}
      skip={{ label: "Pular por agora", onSkip: () => onNext("", "") }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="ob-city">Cidade</Label>
          <Input
            id="ob-city"
            autoFocus
            value={cityValue}
            onChange={(e) => setCityValue(e.target.value)}
            placeholder="São Paulo"
          />
        </div>
        <div>
          <Label htmlFor="ob-address">Endereço</Label>
          <Input
            id="ob-address"
            value={addressValue}
            onChange={(e) => setAddressValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            placeholder="Rua das Flores, 123"
          />
        </div>
      </div>
      <FieldError message={error} />
    </StepShell>
  );
}
