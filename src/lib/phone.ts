/**
 * Tanzanian mobile numbers.
 *
 * A teacher's phone number is their account and the number their mobile
 * money is charged on, so every way of typing it — 0754 312 908,
 * +255 754 312 908, 255754312908 — has to come out as the same value, or one
 * teacher ends up with two accounts. The canonical form is pawaPay's: 255
 * followed by nine digits, no plus.
 *
 * Network prefixes follow ResultsPortal's pawaPay integration, which is live:
 *
 *   Vodacom   074 075 076        Airtel   068 069 078
 *   Yas/Tigo  065 067 071        Halotel  061 062
 *
 * TTCL (073) has no mobile money rail on pawaPay, so it is a valid number for
 * signing in but not one we can charge.
 */

export interface Network {
  /** pawaPay's provider code. */
  provider: "VODACOM_TZA" | "TIGO_TZA" | "AIRTEL_TZA" | "HALOTEL_TZA";
  /** What the teacher calls it. */
  name: string;
  prefixes: string[];
}

export const NETWORKS: Network[] = [
  { provider: "VODACOM_TZA", name: "Vodacom M-Pesa", prefixes: ["74", "75", "76"] },
  { provider: "TIGO_TZA", name: "Mixx by Yas", prefixes: ["65", "67", "71"] },
  { provider: "AIRTEL_TZA", name: "Airtel Money", prefixes: ["68", "69", "78"] },
  { provider: "HALOTEL_TZA", name: "HaloPesa", prefixes: ["61", "62"] },
];

/** 255XXXXXXXXX, or null when the input is not a Tanzanian mobile number. */
export function normalisePhone(input: string): string | null {
  let digits = String(input ?? "").replace(/[^\d]/g, "");
  if (digits.startsWith("255")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  // Nine digits remain: a 6x or 7x prefix and seven more.
  return /^[67]\d{8}$/.test(digits) ? `255${digits}` : null;
}

/** The mobile money network a normalised number is on, or null. */
export function networkFor(msisdn: string): Network | null {
  const prefix = String(msisdn).slice(3, 5);
  return NETWORKS.find((n) => n.prefixes.includes(prefix)) ?? null;
}

/** 255754312908 → "0754 312 908", the way people write it. */
export function displayPhone(msisdn: string): string {
  const national = `0${String(msisdn).slice(3)}`;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
}
