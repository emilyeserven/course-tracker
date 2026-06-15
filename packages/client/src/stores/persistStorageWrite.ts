import type { StorageValue } from "zustand/middleware";

// The write side of a Zustand `PersistStorage` adapter, shared by the persist
// stores. Each store keeps its own `getItem` (their legacy-tolerance differs),
// but `setItem`/`removeItem` are identical: SSR-guarded, JSON-serialized, and
// swallow quota / private-mode failures. Spread these into an adapter, e.g.
// `{ getItem, ...persistStorageWrite() }`.

export function persistedSetItem<S>(
  name: string,
  value: StorageValue<S>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(name, JSON.stringify(value));
  }
  catch {
    // ignore quota / private-mode failures
  }
}

export function persistedRemoveItem(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(name);
  }
  catch {
    // ignore
  }
}
