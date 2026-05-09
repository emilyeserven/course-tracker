export const MODULE_DURATION_BUCKETS = [
  "extra_short",
  "short",
  "medium",
  "long",
  "extra_long",
] as const;

export type ModuleDurationBucket = typeof MODULE_DURATION_BUCKETS[number];

export const MODULE_DURATION_LABELS: Record<ModuleDurationBucket, string> = {
  extra_short: "Extra Short (< 5m)",
  short: "Short (5–15m)",
  medium: "Medium (15–30m)",
  long: "Long (30m–1h)",
  extra_long: "Extra Long (1h+)",
};

export interface Module {
  id: string;
  resourceId: string;
  moduleGroupId?: string | null;
  name: string;
  description?: string | null;
  url?: string | null;
  // Either an integer (as a string) of exact minutes, or one of the
  // ModuleDurationBucket keys.
  length?: string | null;
  /** @deprecated use `length` instead. Kept for migration compatibility. */
  minutesLength?: number | null;
  isComplete: boolean;
  position?: number | null;
}

export function isModuleDurationBucket(
  value: string,
): value is ModuleDurationBucket {
  return (MODULE_DURATION_BUCKETS as readonly string[]).includes(value);
}

export type ParsedModuleLength
  = | { kind: "minutes"; minutes: number }
    | { kind: "bucket"; bucket: ModuleDurationBucket }
    | null;

export function parseModuleLength(length: string | null | undefined): ParsedModuleLength {
  if (!length) return null;
  if (isModuleDurationBucket(length)) {
    return { kind: "bucket", bucket: length };
  }
  const n = Number(length);
  if (Number.isFinite(n) && n >= 0 && Number.isInteger(n)) {
    return { kind: "minutes", minutes: n };
  }
  return null;
}

export function formatModuleLength(length: string | null | undefined): string {
  const parsed = parseModuleLength(length);
  if (!parsed) return "";
  if (parsed.kind === "minutes") return `${parsed.minutes}m`;
  return MODULE_DURATION_LABELS[parsed.bucket];
}
