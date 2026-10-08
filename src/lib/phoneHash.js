// SHA-256 hash of a normalized phone number.
// Same input → same output → two users with the same number produce matching hashes.

const SALT = "rodeo-v1-phone-salt-2026";

export function normalizePhone(input) {
  if (!input) return "";
  // Strip everything except digits
  let digits = String(input).replace(/\D/g, "");
  // If it starts with 0 and is 11 digits (Nigeria-style), convert to +234
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = "234" + digits.slice(1);
  }
  // If it's 10 digits (US-style), prefix with 1
  if (digits.length === 10) {
    digits = "1" + digits;
  }
  return digits;
}

export async function hashPhone(input) {
  const normalized = normalizePhone(input);
  if (!normalized) return "";
  const data = new TextEncoder().encode(SALT + ":" + normalized);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function last4(input) {
  const normalized = normalizePhone(input);
  return normalized.slice(-4);
}
