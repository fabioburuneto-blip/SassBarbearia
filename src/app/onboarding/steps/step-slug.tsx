"use client";

import { useEffect, useRef, useState } from "react";
import { StepShell } from "./step-shell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { slugify, isValidSlug } from "@/lib/slug";
import {
  checkSlugAvailability,
  createBusinessAction,
  type CreateBusinessInput,
} from "../actions";
import type { BusinessSegment } from "@/types/database";

type CheckResult = { slug: string; status: "checking" | "available" | "taken" };
type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

export function StepSlug({
  name,
  segment,
  whatsapp,
  instagram,
  city,
  address,
  initialSlug,
  onBack,
  onCreated,
}: {
  name: string;
  segment: BusinessSegment;
  whatsapp: string;
  instagram: string;
  city: string;
  address: string;
  initialSlug: string;
  onBack: () => void;
  onCreated: (business: { id: string; name: string; slug: string }) => void;
}) {
  const [slug, setSlug] = useState(initialSlug || slugify(name));
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const requestIdRef = useRef(0);

  // Purely derived from `slug` -- computed during render, never synced into
  // state, so there is nothing to set synchronously from an effect.
  const formatValid = slug.length > 0 && isValidSlug(slug);

  useEffect(() => {
    if (!formatValid) return;

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      const result = await checkSlugAvailability(slug);
      if (requestIdRef.current !== requestId) return; // stale response
      setCheck({ slug, status: result.available ? "available" : "taken" });
    }, 450);

    return () => clearTimeout(timer);
  }, [slug, formatValid]);

  const availability: Availability = !slug
    ? "idle"
    : !formatValid
      ? "invalid"
      : check?.slug === slug
        ? check.status
        : "checking";

  async function handleCreate() {
    if (availability !== "available") return;

    setCreating(true);
    setError(undefined);

    const input: CreateBusinessInput = {
      name,
      slug,
      segment,
      whatsapp,
      instagram,
      city,
      address,
    };
    const result = await createBusinessAction(input);
    setCreating(false);

    if (result.error !== undefined) {
      setError(result.error);
      setCheck({ slug, status: "taken" });
      return;
    }

    onCreated(result.business);
  }

  const statusMessage: Record<Availability, string | null> = {
    idle: null,
    checking: "Verificando disponibilidade...",
    available: "Disponível!",
    taken: "Esse endereço já está em uso.",
    invalid:
      "Use apenas letras minúsculas, números e hífens (mín. 3 caracteres).",
  };
  const statusColor: Record<Availability, string> = {
    idle: "text-zinc-500",
    checking: "text-zinc-500",
    available: "text-emerald-600",
    taken: "text-red-600",
    invalid: "text-red-600",
  };

  return (
    <StepShell
      title="Escolha o link público da sua empresa"
      description="É o endereço que você vai compartilhar com seus clientes."
      onBack={onBack}
      onNext={handleCreate}
      nextLabel="Criar minha empresa"
      nextDisabled={availability !== "available"}
      nextPending={creating}
    >
      <Label htmlFor="ob-slug">Endereço público</Label>
      <div className="flex items-center gap-1 text-sm text-zinc-500">
        <span className="whitespace-nowrap">seusite.com/</span>
        <Input
          id="ob-slug"
          autoFocus
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder="barbearia-do-fabio"
        />
      </div>
      {statusMessage[availability] && (
        <p className={`mt-1.5 text-sm ${statusColor[availability]}`}>
          {statusMessage[availability]}
        </p>
      )}
      <FieldError message={error} />
    </StepShell>
  );
}
