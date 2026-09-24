"use client";

import { useState, useTransition } from "react";
import { updateSections } from "./actions";
import {
  LOCKED_SECTIONS,
  SECTION_LABELS,
  moveSection,
  toggleSection,
  type SectionConfig,
} from "@/lib/themes/sections";

export function SectionsEditor({
  initialSections,
}: {
  initialSections: SectionConfig[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function persist(next: SectionConfig[]) {
    setSections(next);
    startTransition(async () => {
      const result = await updateSections(next);
      if (result?.error) setError(result.error);
      else setError(null);
    });
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {sections.map((section, index) => {
          const locked = LOCKED_SECTIONS.includes(section.key);
          return (
            <li
              key={section.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  disabled={locked || isPending}
                  onChange={() => persist(toggleSection(sections, section.key))}
                />
                <span className={locked ? "text-zinc-400" : "text-zinc-800"}>
                  {SECTION_LABELS[section.key]}
                  {locked && " (sempre visível)"}
                </span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Mover para cima"
                  disabled={index === 0 || isPending}
                  onClick={() =>
                    persist(moveSection(sections, section.key, "up"))
                  }
                  className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Mover para baixo"
                  disabled={index === sections.length - 1 || isPending}
                  onClick={() =>
                    persist(moveSection(sections, section.key, "down"))
                  }
                  className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
