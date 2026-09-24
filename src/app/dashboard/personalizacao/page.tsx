import Link from "next/link";
import { getCurrentBusiness } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { normalizeSections } from "@/lib/themes/sections";
import { InfoForm } from "./info-form";
import { ThemePicker } from "./theme-picker";
import { ImageUploader } from "./image-uploader";
import { GalleryManager } from "./gallery-manager";
import { SectionsEditor } from "./sections-editor";
import type { ThemePreset } from "@/lib/themes/presets";

export default async function PersonalizacaoPage() {
  const { supabase, business } = await getCurrentBusiness();

  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("business_id", business.id)
    .single();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Personalização
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Deixe sua página pública com a cara do seu negócio.
          </p>
        </div>
        <Link href="/preview" target="_blank">
          <Button variant="secondary">Visualizar página</Button>
        </Link>
      </div>

      <Card>
        <h2 className="mb-3 font-medium text-zinc-900">Informações</h2>
        <InfoForm business={business} />
      </Card>

      <Card className="flex flex-col gap-6 sm:flex-row">
        <ImageUploader
          businessId={business.id}
          kind="logo"
          currentUrl={business.logo_url}
          label="Logo (foto da empresa)"
        />
        <ImageUploader
          businessId={business.id}
          kind="cover"
          currentUrl={business.cover_url}
          label="Imagem de capa (foto principal)"
        />
      </Card>

      <Card>
        <h2 className="mb-3 font-medium text-zinc-900">Galeria de fotos</h2>
        <GalleryManager
          businessId={business.id}
          initialImages={theme?.gallery_urls ?? []}
        />
      </Card>

      <Card>
        {theme && (
          <ThemePicker
            businessName={business.name}
            initialPreset={(theme.preset as ThemePreset) ?? "modern"}
            initialPrimary={theme.primary_color}
            initialSecondary={theme.secondary_color}
          />
        )}
      </Card>

      <Card>
        <h2 className="mb-1 font-medium text-zinc-900">Seções da página</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Escolha o que aparece na sua página pública e em que ordem.
        </p>
        <SectionsEditor initialSections={normalizeSections(theme?.sections)} />
      </Card>
    </div>
  );
}
