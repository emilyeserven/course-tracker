/**
 * Deep-compares flat form value objects to detect if any field has changed
 * from its original value. Nested arrays/objects are compared by value (not
 * reference), so a refetch that yields a new-but-equivalent array does not
 * register as a change. Handles Date via `.getTime()` and null.
 */
export function formHasChanges(
  currentValues: Record<string, unknown>,
  defaultValues: Record<string, unknown>,
): boolean {
  const keys = Object.keys(defaultValues);
  for (const key of keys) {
    if (!valuesEqual(currentValues[key], defaultValues[key])) {
      return true;
    }
  }
  return false;
}

/**
 * Structural value equality for plain form data: primitives (`===`), Dates
 * (`.getTime()`), arrays (order-sensitive, element-wise), and plain objects
 * (same keys, deep-equal values). Form values are JSON-shaped (no cycles), so
 * plain recursion is safe.
 */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length && a.every((item, i) => valuesEqual(item, b[i]))
    );
  }
  if (
    typeof a === "object"
    && a !== null
    && !Array.isArray(a)
    && !(a instanceof Date)
    && typeof b === "object"
    && b !== null
    && !Array.isArray(b)
    && !(b instanceof Date)
  ) {
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const aKeys = Object.keys(aRecord);
    const bKeys = Object.keys(bRecord);
    return (
      aKeys.length === bKeys.length
      && aKeys.every(
        key =>
          Object.prototype.hasOwnProperty.call(bRecord, key)
          && valuesEqual(aRecord[key], bRecord[key]),
      )
    );
  }
  return false;
}
