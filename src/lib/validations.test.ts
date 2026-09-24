import { describe, expect, it } from "vitest";
import {
  createBusinessSchema,
  serviceSchema,
  publicBookingSchema,
  onboardingWhatsappSchema,
  onboardingInstagramSchema,
  onboardingLocationSchema,
  onboardingSlugSchema,
} from "./validations";

describe("createBusinessSchema", () => {
  it("accepts a valid payload", () => {
    const result = createBusinessSchema.safeParse({
      name: "Barbearia do Fábio",
      slug: "barbearia-do-fabio",
      segment: "barbershop",
      timezone: "America/Sao_Paulo",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const result = createBusinessSchema.safeParse({
      name: "Barbearia",
      slug: "Barbearia Inválida!",
      segment: "barbershop",
      timezone: "America/Sao_Paulo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown segment", () => {
    const result = createBusinessSchema.safeParse({
      name: "Barbearia",
      slug: "barbearia",
      segment: "not-a-real-segment",
      timezone: "America/Sao_Paulo",
    });
    expect(result.success).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("coerces numeric strings from form data", () => {
    const result = serviceSchema.safeParse({
      name: "Corte",
      duration_minutes: "30",
      price: "50.5",
      is_active: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration_minutes).toBe(30);
      expect(result.data.price).toBe(50.5);
    }
  });

  it("rejects a negative price", () => {
    const result = serviceSchema.safeParse({
      name: "Corte",
      duration_minutes: "30",
      price: "-10",
    });
    expect(result.success).toBe(false);
  });
});

describe("publicBookingSchema", () => {
  it("requires a name and phone", () => {
    const result = publicBookingSchema.safeParse({
      service_id: "11111111-1111-1111-1111-111111111111",
      professional_id: "22222222-2222-2222-2222-222222222222",
      starts_at: new Date().toISOString(),
      customer_name: "A",
      customer_phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid booking payload", () => {
    const result = publicBookingSchema.safeParse({
      service_id: "11111111-1111-4111-8111-111111111111",
      professional_id: "22222222-2222-4222-8222-222222222222",
      starts_at: new Date().toISOString(),
      customer_name: "Maria Silva",
      customer_phone: "11999999999",
    });
    expect(result.success).toBe(true);
  });
});

describe("onboardingWhatsappSchema", () => {
  it("is optional", () => {
    expect(onboardingWhatsappSchema.safeParse({ whatsapp: "" }).success).toBe(
      true,
    );
    expect(onboardingWhatsappSchema.safeParse({}).success).toBe(true);
  });

  it("rejects a number that is too short", () => {
    expect(
      onboardingWhatsappSchema.safeParse({ whatsapp: "123" }).success,
    ).toBe(false);
  });

  it("accepts a formatted Brazilian phone number", () => {
    expect(
      onboardingWhatsappSchema.safeParse({ whatsapp: "(11) 99999-9999" })
        .success,
    ).toBe(true);
  });
});

describe("onboardingInstagramSchema", () => {
  it("strips a leading @", () => {
    const result = onboardingInstagramSchema.safeParse({
      instagram: "@barbearia.dom",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.instagram).toBe("barbearia.dom");
    }
  });

  it("rejects handles with spaces", () => {
    expect(
      onboardingInstagramSchema.safeParse({ instagram: "barbearia dom" })
        .success,
    ).toBe(false);
  });
});

describe("onboardingLocationSchema", () => {
  it("allows both fields to be empty", () => {
    expect(
      onboardingLocationSchema.safeParse({ city: "", address: "" }).success,
    ).toBe(true);
  });
});

describe("onboardingSlugSchema", () => {
  it("rejects a reserved slug", () => {
    expect(
      onboardingSlugSchema.safeParse({ slug: "criar-conta" }).success,
    ).toBe(false);
  });

  it("accepts a normal slug", () => {
    expect(
      onboardingSlugSchema.safeParse({ slug: "barbearia-dom" }).success,
    ).toBe(true);
  });
});
