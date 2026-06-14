import { STORAGE_KEYS } from "@/constants/storageKeys";
import { createPersistedValueStore } from "@/stores/createPersistedValue";

const DEFAULT_RING = "Trial";

/**
 * Persists the "Explore Something" card's selected ring in localStorage. When
 * the stored ring isn't among the available ring names (config changed, or
 * first use), falls back to "Trial" if present, otherwise the first ring.
 */
export function useExploreRing(rings: string[] | undefined) {
  const useStore = createPersistedValueStore<string>(
    STORAGE_KEYS.exploreRing,
    DEFAULT_RING,
  );
  const storedRing = useStore(s => s.value);
  const setValue = useStore(s => s.setValue);

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
    setRing: (next: string) => setValue(next),
  };
}
