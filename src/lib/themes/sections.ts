/**
 * Registry of the blocks a public business page can be composed from. This
 * is the single source of truth for section keys -- the DB stores an
 * ordered `sections` jsonb array on `themes` (array order = display order),
 * the dashboard reorders/toggles against this list, and ThemeRenderer reads
 * it to decide what to render and in which order. No section has its own
 * hardcoded page: adding a business never means writing a new component.
 */

export const SECTION_KEYS = [
  "hero",
  "about",
  "services",
  "team",
  "gallery",
  "booking",
  "location",
  "social",
  "footer",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type SectionConfig = {
  key: SectionKey;
  enabled: boolean;
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Capa (hero)",
  about: "Sobre a empresa",
  services: "Serviços",
  team: "Profissionais",
  gallery: "Galeria de fotos",
  booking: "Agendamento",
  location: "Localização",
  social: "Redes sociais",
  footer: "Rodapé",
};

/** These always render -- turning off the hero or the footer leaves the
 * page without an identity or a bottom edge, so the dashboard doesn't
 * offer a toggle for them. */
export const LOCKED_SECTIONS: readonly SectionKey[] = ["hero", "footer"];

export const DEFAULT_SECTIONS: SectionConfig[] = SECTION_KEYS.map((key) => ({
  key,
  enabled: true,
}));

function isSectionKey(value: unknown): value is SectionKey {
  return (
    typeof value === "string" &&
    (SECTION_KEYS as readonly string[]).includes(value)
  );
}

/**
 * Defensively parses whatever is stored in `themes.sections` (jsonb from
 * Postgres, so untyped at the TS boundary) into a complete, valid,
 * duplicate-free list covering every known section exactly once. Unknown
 * keys are dropped (e.g. a section removed in a later release); missing
 * keys are appended as enabled, so new sections show up for existing
 * businesses instead of silently never rendering.
 */
export function normalizeSections(input: unknown): SectionConfig[] {
  const source = Array.isArray(input) ? input : [];
  const seen = new Set<SectionKey>();
  const result: SectionConfig[] = [];

  for (const item of source) {
    if (
      item &&
      typeof item === "object" &&
      "key" in item &&
      isSectionKey((item as { key: unknown }).key)
    ) {
      const key = (item as { key: SectionKey }).key;
      if (seen.has(key)) continue;
      seen.add(key);
      const enabledRaw = (item as { enabled?: unknown }).enabled;
      result.push({ key, enabled: enabledRaw !== false });
    }
  }

  for (const key of SECTION_KEYS) {
    if (!seen.has(key)) result.push({ key, enabled: true });
  }

  return result;
}

export function toggleSection(
  sections: SectionConfig[],
  key: SectionKey,
): SectionConfig[] {
  if (LOCKED_SECTIONS.includes(key)) return sections;
  return sections.map((section) =>
    section.key === key ? { ...section, enabled: !section.enabled } : section,
  );
}

export function moveSection(
  sections: SectionConfig[],
  key: SectionKey,
  direction: "up" | "down",
): SectionConfig[] {
  const index = sections.findIndex((section) => section.key === key);
  if (index === -1) return sections;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) return sections;

  const copy = [...sections];
  const [moved] = copy.splice(index, 1);
  copy.splice(targetIndex, 0, moved);
  return copy;
}
