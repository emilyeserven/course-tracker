// Parse a cost-like string into a finite number, defaulting to 0.
export function parseCost(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
