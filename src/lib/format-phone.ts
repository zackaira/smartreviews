/**
 * Normalize a phone number for storage: remove spaces only.
 * e.g. "+27 82 453 2805" → "+27824532805", "082 453 2805" → "0824532805"
 */
export function normalizePhone(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Format a phone number for display as the user types.
 * - Starts with + → international: +27 82 453 2805
 * - Starts with 0 → local: 082 453 2805
 */
export function formatPhone(input: string): string {
  const trimmed = input.trimStart();
  const digits = input.replace(/\D/g, "");
  const startsWithPlus = trimmed.startsWith("+");
  const startsWithZero = trimmed.startsWith("0");

  if (startsWithPlus) {
    if (digits.length === 0) return "+";
    const country = digits.slice(0, 2);
    const a = digits.slice(2, 4);
    const b = digits.slice(4, 7);
    const c = digits.slice(7, 11);
    return ["+" + country, a || "", b || "", c || ""].filter(Boolean).join(" ");
  }

  if (startsWithZero || digits.length > 0) {
    const d =
      startsWithZero || (trimmed.length > 0 && /^\d/.test(trimmed))
        ? "0" + digits.replace(/^0+/, "")
        : digits;
    if (d.length <= 2) return d;
    if (d.length <= 5) return d.slice(0, 3) + " " + d.slice(3);
    if (d.length <= 9)
      return d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6);
    return d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6, 10);
  }

  return input;
}
