"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addGalleryImage, removeGalleryImage } from "./actions";
import { Button } from "@/components/ui/button";

export function GalleryManager({
  businessId,
  initialImages,
}: {
  businessId: string;
  initialImages: string[];
}) {
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("Selecione apenas arquivos de imagem.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Cada imagem deve ter até 5MB.");
        continue;
      }
      if (images.length >= 12) {
        setError("Máximo de 12 fotos na galeria.");
        break;
      }

      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${businessId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business-assets")
        .upload(path, file);

      if (uploadError) {
        setError("Falha no upload de uma das imagens.");
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("business-assets").getPublicUrl(path);

      setImages((prev) => [...prev, publicUrl]);
      startTransition(async () => {
        const result = await addGalleryImage(publicUrl);
        if (result?.error) setError(result.error);
      });
    }
  }

  function handleRemove(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
    startTransition(async () => {
      const result = await removeGalleryImage(url);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200"
          >
            <Image
              src={url}
              alt="Foto da galeria"
              fill
              sizes="150px"
              unoptimized
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              disabled={isPending}
              className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        disabled={isPending || images.length >= 12}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? "Enviando..." : "Adicionar fotos"}
      </Button>
      <p className="mt-1 text-xs text-zinc-400">{images.length}/12 fotos</p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
