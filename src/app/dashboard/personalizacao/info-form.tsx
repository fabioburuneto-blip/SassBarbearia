"use client";

import { useActionState } from "react";
import {
  updatePersonalizationInfo,
  type PersonalizationFormState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import type { Database } from "@/types/database";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export function InfoForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState<
    PersonalizationFormState,
    FormData
  >(updatePersonalizationInfo, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="pers-name">Nome da empresa</Label>
        <Input
          id="pers-name"
          name="name"
          defaultValue={business.name}
          required
        />
      </div>
      <div>
        <Label htmlFor="pers-description">Descrição</Label>
        <Textarea
          id="pers-description"
          name="description"
          rows={3}
          defaultValue={business.description ?? ""}
          placeholder="Uma frase sobre o seu negócio para os clientes."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pers-whatsapp">WhatsApp</Label>
          <Input
            id="pers-whatsapp"
            name="whatsapp"
            defaultValue={business.whatsapp ?? ""}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <Label htmlFor="pers-instagram">Instagram</Label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-zinc-500">@</span>
            <Input
              id="pers-instagram"
              name="instagram"
              defaultValue={business.instagram ?? ""}
              placeholder="usuario"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pers-city">Cidade</Label>
          <Input
            id="pers-city"
            name="city"
            defaultValue={business.city ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="pers-address">Endereço</Label>
          <Input
            id="pers-address"
            name="address"
            defaultValue={business.address ?? ""}
          />
        </div>
      </div>

      <FieldError message={state?.error} />
      {state?.success && (
        <p className="text-sm text-emerald-600">Informações salvas.</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Salvar informações"}
      </Button>
    </form>
  );
}
