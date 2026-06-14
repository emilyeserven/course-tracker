import type { DashboardLayout } from "@emstack/types";

import { useState } from "react";

import { STORAGE_KEYS } from "@/constants/storageKeys";

const STORAGE_KEY = STORAGE_KEYS.dashboardLayoutId;

/**
 * Persists the dashboard's selected layout tab in localStorage. When the
 * stored id no longer exists (layout deleted elsewhere), falls back to the
 * first layout — so deleting the active layout needs no special handling.
 */
export function useActiveDashboardLayoutId(
  layouts: DashboardLayout[] | undefined,
) {
  const [storedId, setStoredId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    }
    catch {
      return null;
    }
  });

  const setActiveId = (id: string) => {
    setStoredId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    }
    catch {
      // Ignore storage failures (private mode / quota) — selection still
      // works for the session.
    }
  };

  const activeId = layouts?.some(l => l.id === storedId)
    ? storedId
    : (layouts?.[0]?.id ?? null);

  return {
    activeId,
    setActiveId,
  };
}
