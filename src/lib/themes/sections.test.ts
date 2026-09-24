import { describe, expect, it } from "vitest";
import {
  DEFAULT_SECTIONS,
  SECTION_KEYS,
  moveSection,
  normalizeSections,
  toggleSection,
} from "./sections";

describe("normalizeSections", () => {
  it("fills in every known section when given null/undefined", () => {
    const result = normalizeSections(null);
    expect(result.map((s) => s.key)).toEqual([...SECTION_KEYS]);
    expect(result.every((s) => s.enabled)).toBe(true);
  });

  it("preserves a valid partial order and appends missing keys", () => {
    const result = normalizeSections([
      { key: "footer", enabled: true },
      { key: "hero", enabled: true },
    ]);
    expect(result[0].key).toBe("footer");
    expect(result[1].key).toBe("hero");
    expect(result).toHaveLength(SECTION_KEYS.length);
  });

  it("drops unknown keys and duplicate keys", () => {
    const result = normalizeSections([
      { key: "hero", enabled: true },
      { key: "hero", enabled: false },
      { key: "not-a-real-section", enabled: true },
    ]);
    expect(result.filter((s) => s.key === "hero")).toHaveLength(1);
    expect(result.some((s) => (s.key as string) === "not-a-real-section")).toBe(
      false,
    );
  });

  it("treats a missing enabled field as enabled, but respects enabled: false", () => {
    const result = normalizeSections([{ key: "gallery" }]);
    expect(result.find((s) => s.key === "gallery")?.enabled).toBe(true);

    const disabled = normalizeSections([{ key: "gallery", enabled: false }]);
    expect(disabled.find((s) => s.key === "gallery")?.enabled).toBe(false);
  });
});

describe("toggleSection", () => {
  it("flips a regular section", () => {
    const result = toggleSection(DEFAULT_SECTIONS, "services");
    expect(result.find((s) => s.key === "services")?.enabled).toBe(false);
  });

  it("never flips a locked section (hero/footer)", () => {
    const result = toggleSection(DEFAULT_SECTIONS, "hero");
    expect(result.find((s) => s.key === "hero")?.enabled).toBe(true);
  });
});

describe("moveSection", () => {
  it("swaps with the previous section when moving up", () => {
    const result = moveSection(DEFAULT_SECTIONS, "about", "up");
    expect(result.map((s) => s.key)[0]).toBe("about");
    expect(result.map((s) => s.key)[1]).toBe("hero");
  });

  it("is a no-op moving the first section further up", () => {
    const result = moveSection(DEFAULT_SECTIONS, "hero", "up");
    expect(result).toEqual(DEFAULT_SECTIONS);
  });

  it("is a no-op moving the last section further down", () => {
    const result = moveSection(DEFAULT_SECTIONS, "footer", "down");
    expect(result).toEqual(DEFAULT_SECTIONS);
  });
});
