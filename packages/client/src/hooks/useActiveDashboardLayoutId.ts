import type { DashboardLayout } from "@emstack/types";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import { createPersistedValueStore } from "@/stores/createPersistedValue";

/**
 * Persists the dashboard's selected layout tab in localStorage. When the
 * stored id no longer exists (layout deleted elsewhere), falls back to the
 * first layout — so deleting the active layout needs no special handling.
 */
export function useActiveDashboardLayoutId(
  layouts: DashboardLayout[] | undefined,
) {
  const useStore = createPersistedValueStore<string | null>(
    STORAGE_KEYS.dashboardLayoutId,
    null,
  );
  const storedId = useStore(s => s.value);
  const setValue = useStore(s => s.setValue);

  const activeId = layouts?.some(l => l.id === storedId)
    ? storedId
    : (layouts?.[0]?.id ?? null);

  return {
    activeId,
    setActiveId: (id: string) => setValue(id),
  };
}
