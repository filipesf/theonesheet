export function sanitiseDigits(raw: string): number {
  const digitsOnly = raw.replace(/\D/g, '');
  return digitsOnly === '' ? 0 : Number(digitsOnly);
}
