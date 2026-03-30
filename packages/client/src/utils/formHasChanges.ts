/**
 * Deep-compares flat form value objects to detect if any field has changed
 * from its original value. Handles Date comparison via `.getTime()` and null.
 */
export function formHasChanges(
  currentValues: Record<string, unknown>,
  defaultValues: Record<string, unknown>,
): boolean {
  const keys = Object.keys(defaultValues);
  for (const key of keys) {
    const current = currentValues[key];
    const original = defaultValues[key];

    if (current instanceof Date && original instanceof Date) {
      if (current.getTime() !== original.getTime()) return true;
    }
    else if (current !== original) {
      return true;
    }
  }
  return false;
}
