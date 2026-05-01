export function sanitiseDigits(
  raw: string,
  opts?: { min?: number; max?: number },
): number {
  const min = opts?.min ?? 0;
  const max = opts?.max;
  const trimmed = raw.trim();
  // Reject explicit negatives by falling back to `min` rather than silently
  // stripping the sign (which would flip "-5" into "5" — see QA BUG-002).
  if (trimmed.startsWith('-')) return min;
  const digitsOnly = trimmed.replace(/\D/g, '');
  const parsed = digitsOnly === '' ? 0 : Number(digitsOnly);
  if (max !== undefined && parsed > max) return max;
  if (parsed < min) return min;
  return parsed;
}
