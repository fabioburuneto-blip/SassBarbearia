/** Builds a wa.me deep link from a Brazilian phone number in any common
 * format. Assumes DDD+number without a country code means Brazil (+55) --
 * a reasonable default given the product targets the Brazilian market. */
export function whatsappLink(rawPhone: string, message?: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountryCode}${query}`;
}
