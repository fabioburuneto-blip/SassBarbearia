"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function StepSuccess({
  business,
}: {
  business: { name: string; slug: string };
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const publicPath = `/${business.slug}`;
  const publicUrl = `${siteUrl}${publicPath}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
        ✓
      </div>
      <h1 className="text-xl font-semibold text-zinc-900">
        {business.name} está pronta!
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Sua página de agendamentos já está no ar.
      </p>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700">
        seusite.com{publicPath}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Link href={publicPath} target="_blank">
          <Button className="w-full">Ver minha página</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary" className="w-full">
            Ir para o painel
          </Button>
        </Link>
        <Button variant="ghost" className="w-full" onClick={handleCopy}>
          {copied ? "Link copiado!" : "Copiar link"}
        </Button>
      </div>
    </div>
  );
}
