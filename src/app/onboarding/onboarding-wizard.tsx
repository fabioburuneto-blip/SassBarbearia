"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./progress-bar";
import { StepName } from "./steps/step-name";
import { StepSegment } from "./steps/step-segment";
import { StepWhatsapp } from "./steps/step-whatsapp";
import { StepInstagram } from "./steps/step-instagram";
import { StepLocation } from "./steps/step-location";
import { StepSlug } from "./steps/step-slug";
import { StepTheme } from "./steps/step-theme";
import { StepServices } from "./steps/step-services";
import { StepHours } from "./steps/step-hours";
import { StepSuccess } from "./steps/step-success";
import type { BusinessSegment } from "@/types/database";

type WizardData = {
  name: string;
  segment: BusinessSegment | "";
  whatsapp: string;
  instagram: string;
  city: string;
  address: string;
  slug: string;
};

type CreatedBusiness = { id: string; name: string; slug: string };

const initialData: WizardData = {
  name: "",
  segment: "",
  whatsapp: "",
  instagram: "",
  city: "",
  address: "",
  slug: "",
};

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [business, setBusiness] = useState<CreatedBusiness | null>(null);

  if (step === 10 && business) {
    return (
      <Card className="w-full max-w-md">
        <StepSuccess business={business} />
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <ProgressBar step={step} />

      {step === 1 && (
        <StepName
          value={data.name}
          onNext={(name) => {
            setData((d) => ({ ...d, name }));
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <StepSegment
          value={data.segment}
          onBack={() => setStep(1)}
          onNext={(segment) => {
            setData((d) => ({ ...d, segment }));
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <StepWhatsapp
          value={data.whatsapp}
          onBack={() => setStep(2)}
          onNext={(whatsapp) => {
            setData((d) => ({ ...d, whatsapp }));
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <StepInstagram
          value={data.instagram}
          onBack={() => setStep(3)}
          onNext={(instagram) => {
            setData((d) => ({ ...d, instagram }));
            setStep(5);
          }}
        />
      )}

      {step === 5 && (
        <StepLocation
          city={data.city}
          address={data.address}
          onBack={() => setStep(4)}
          onNext={(city, address) => {
            setData((d) => ({ ...d, city, address }));
            setStep(6);
          }}
        />
      )}

      {step === 6 && data.segment && (
        <StepSlug
          name={data.name}
          segment={data.segment}
          whatsapp={data.whatsapp}
          instagram={data.instagram}
          city={data.city}
          address={data.address}
          initialSlug={data.slug}
          onBack={() => setStep(5)}
          onCreated={(created) => {
            setData((d) => ({ ...d, slug: created.slug }));
            setBusiness(created);
            setStep(7);
          }}
        />
      )}

      {step === 7 && business && <StepTheme onNext={() => setStep(8)} />}

      {step === 8 && business && (
        <StepServices
          businessId={business.id}
          onBack={() => setStep(7)}
          onNext={() => setStep(9)}
        />
      )}

      {step === 9 && business && (
        <StepHours onBack={() => setStep(8)} onNext={() => setStep(10)} />
      )}
    </Card>
  );
}
