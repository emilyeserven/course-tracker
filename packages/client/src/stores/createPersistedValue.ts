import type { StoreApi, UseBoundStore } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A store holding a single persisted value plus its setter. */
export interface PersistedValue<T> {
  value: T;
  setValue: (value: T) => void;
}

interface CreatePersistedValueOptions {
  /** Pre-rename key to read once if the primary key has no stored value. */
  legacyKey?: string;
}

type PersistedValueStore<T> = UseBoundStore<StoreApi<PersistedValue<T>>>;

/**
 * localStorage adapter that tolerates the pre-Zustand value shape. The hooks
 * this factory replaces stored a bare string (e.g. `"table"`, a ring name, a
 * layout id) via `localStorage.setItem(key, value)`; `persist` wraps state as
 * `{ state, version }`. On read we return a real envelope as-is and treat
 * anything else (a non-JSON bare string, or a legacy-key fallback) as a
 * version-0 value so existing preferences survive the upgrade.
 */
function createLegacyTolerantStorage<T>(
  legacyKey: string | undefined,
): PersistStorage<PersistedValue<T>> {
  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;
      let raw: string | null;
      try {
        raw
          = window.localStorage.getItem(name)
            ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
      }
      catch {
        return null;
      }
      if (raw == null) return null;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "state" in parsed) {
          return parsed as StorageValue<PersistedValue<T>>;
        }
      }
      catch {
        // Not JSON — fall through to the legacy bare-value path below.
      }
      return {
        state: {
          value: raw as T,
        } as PersistedValue<T>,
        version: 0,
      };
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(name, JSON.stringify(value));
      }
      catch {
        // ignore quota / private-mode failures
      }
    },
    removeItem: (name) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.removeItem(name);
      }
      catch {
        // ignore
      }
    },
  };
}

const storeCache = new Map<string, PersistedValueStore<unknown>>();

/**
 * Create (or reuse) a Zustand store that persists a single value under
 * `localStorage[key]`, exposing `{ value, setValue }`. The `persist` middleware
 * handles the SSR guard, serialization, and rehydration that each bespoke
 * `localStorage` hook used to re-implement by hand.
 *
 * Stores are cached per key, so calling this during render with a stable key
 * (the call sites all pass literals) returns the same store every time — safe
 * to select from like any Zustand hook. `useStoredViewMode` is used with two
 * different keys, hence the cache rather than a single global store.
 */
export function createPersistedValueStore<T>(
  key: string,
  initial: T,
  options: CreatePersistedValueOptions = {},
): PersistedValueStore<T> {
  const {
    legacyKey,
  } = options;
  const cacheKey = legacyKey ? `${key}::${legacyKey}` : key;
  const cached = storeCache.get(cacheKey);
  if (cached) {
    return cached as PersistedValueStore<T>;
  }

  const store = create<PersistedValue<T>>()(
    persist(
      set => ({
        value: initial,
        setValue: value =>
          set({
            value,
          }),
      }),
      {
        name: key,
        storage: createLegacyTolerantStorage<T>(legacyKey),
      },
    ),
  );

  storeCache.set(cacheKey, store as PersistedValueStore<unknown>);
  return store;
}
