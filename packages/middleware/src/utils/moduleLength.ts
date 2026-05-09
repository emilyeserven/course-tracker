import {
  isModuleDurationBucket,
} from "@emstack/types/src";

// Normalize the incoming module length value to the unified `length` column
// shape. Accepts the new `length` string OR the legacy `minutesLength`
// integer for backwards compatibility. Invalid values become null.
export function coerceModuleLength(
  length: string | null | undefined,
  legacyMinutes: number | null | undefined,
): string | null {
  if (length != null) {
    if (length === "") return null;
    if (isModuleDurationBucket(length)) return length;
    const n = Number(length);
    if (Number.isFinite(n) && n >= 0 && Number.isInteger(n)) return String(n);
    return null;
  }
  if (legacyMinutes != null && Number.isFinite(legacyMinutes)) {
    return String(Math.max(0, Math.floor(legacyMinutes)));
  }
  return null;
}
