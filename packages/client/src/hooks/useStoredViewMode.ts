import type { ViewMode } from "@/components/listControls";

import { useState } from "react";

interface UseStoredViewModeOptions {
  /** Pre-rename key to fall back to so existing preferences survive. */
  legacyKey?: string;
}

interface UseStoredViewModeResult {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

/**
 * Grid/table view-mode state persisted to localStorage. Lazily reads
 * `storageKey` (then `legacyKey`, if given) on mount — SSR-guarded, treating a
 * stored "table" as table and anything else as grid — and writes back on every
 * change. Replaces the per-list-page getInitialViewMode + updateViewMode pair.
 */
export function useStoredViewMode(
  storageKey: string,
  {
    legacyKey,
  }: UseStoredViewModeOptions = {},
): UseStoredViewModeResult {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const stored
      = window.localStorage.getItem(storageKey)
        ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    return stored === "table" ? "table" : "grid";
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, mode);
    }
  };

  return {
    viewMode,
    setViewMode,
  };
}
