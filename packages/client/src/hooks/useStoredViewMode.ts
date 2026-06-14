import type { ViewMode } from "@/components/listControls";

import { createPersistedValueStore } from "@/stores/createPersistedValue";

interface UseStoredViewModeOptions {
  /** Pre-rename key to fall back to so existing preferences survive. */
  legacyKey?: string;
}

interface UseStoredViewModeResult {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

/**
 * Grid/table view-mode state persisted to localStorage via a shared Zustand
 * store (one per `storageKey`, with an optional `legacyKey` read once for
 * renamed lists). A stored "table" reads as table and anything else as grid.
 * Replaces the per-list-page getInitialViewMode + updateViewMode pair.
 */
export function useStoredViewMode(
  storageKey: string,
  {
    legacyKey,
  }: UseStoredViewModeOptions = {},
): UseStoredViewModeResult {
  const useStore = createPersistedValueStore<string>(storageKey, "grid", {
    legacyKey,
  });
  const stored = useStore(s => s.value);
  const setValue = useStore(s => s.setValue);

  return {
    viewMode: stored === "table" ? "table" : "grid",
    setViewMode: setValue,
  };
}
