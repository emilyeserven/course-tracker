import { useState } from "react";

import { STORAGE_KEYS } from "@/constants/storageKeys";

const STORAGE_KEY = STORAGE_KEYS.exploreRing;
const DEFAULT_RING = "Trial";

/**
 * Persists the "Explore Something" card's selected ring in localStorage. When
 * the stored ring isn't among the available ring names (config changed, or
 * first use), falls back to "Trial" if present, otherwise the first ring.
 */
export function useExploreRing(rings: string[] | undefined) {
  const [storedRing, setStoredRing] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_RING;
    }
    catch {
      return DEFAULT_RING;
    }
  });

  const setRing = (ring: string) => {
    setStoredRing(ring);
    try {
      localStorage.setItem(STORAGE_KEY, ring);
    }
    catch {
      // Ignore storage failures (private mode / quota) — selection still works
      // for the session.
    }
  };

  // While rings are still loading, surface the stored value as-is so the
  // <Select> has a stable value and doesn't flicker.
  const ring
    = !rings || rings.includes(storedRing)
      ? storedRing
      : rings.includes(DEFAULT_RING)
        ? DEFAULT_RING
        : (rings[0] ?? DEFAULT_RING);

  return {
    ring,
    setRing,
  };
}
