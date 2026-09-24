"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createService,
  type ServiceFormState,
} from "@/app/dashboard/services/actions";
import { StepShell } from "./step-shell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { formatPriceCents } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Service = Pick<
  Database["public"]["Tables"]["services"]["Row"],
  "id" | "name" | "duration_minutes" | "price_cents"
>;

export function StepServices({
  businessId,
  onBack,
  onNext,
}: {
  businessId: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [state, formAction, pending] = useActionState<
    ServiceFormState,
    FormData
  >(createService, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  const refreshServices = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });
    setServices(data ?? []);
  }, [businessId]);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      void refreshServices();
    }
    wasPending.current = pending;
  }, [pending, state, refreshServices]);

  return (
    <StepShell
      title="Cadastre seus primeiros serviços"
      description="Você pode adicionar quantos quiser. Também dá para fazer isso depois no painel."
      onBack={onBack}
      onNext={onNext}
      nextLabel={services.length > 0 ? "Continuar" : "Continuar sem serviços"}
    >
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="ob-service-name">Nome do serviço</Label>
            <Input
              id="ob-service-name"
              name="name"
              placeholder="Corte masculino"
              required
            />
          </div>
          <div>
            <Label htmlFor="ob-service-duration">Duração (min)</Label>
            <Input
              id="ob-service-duration"
              name="duration_minutes"
              type="number"
              min={5}
              defaultValue={30}
              required
            />
          </div>
          <div>
            <Label htmlFor="ob-service-price">Preço (R$)</Label>
            <Input
              id="ob-service-price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </div>
        </div>

        <FieldError message={state?.error} />

        <button
          type="submit"
          disabled={pending}
          className="self-start text-sm font-medium text-zinc-900 underline disabled:text-zinc-400"
        >
          {pending ? "Adicionando..." : "+ Adicionar serviço"}
        </button>
      </form>

      {services.length > 0 && (
        <ul className="mt-6 divide-y divide-zinc-100 rounded-lg border border-zinc-200">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="font-medium text-zinc-800">{service.name}</span>
              <span className="text-zinc-500">
                {service.duration_minutes} min ·{" "}
                {formatPriceCents(service.price_cents)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </StepShell>
  );
}
