import type { Dispatch, SetStateAction } from "react";

import { useEffect, useState } from "react";

interface UseRowSelectionResult {
  selectedIds: Set<string>;
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  toggleSelected: (id: string) => void;
  toggleSelectAllVisible: () => void;
  clearSelection: () => void;
}

export function useRowSelection(visibleIds: string[]): UseRowSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drop selections that are no longer visible (after filter changes or
  // server-side deletion).
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const visible = new Set(visibleIds);
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visible.has(id)) {
          next.add(id);
        }
        else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [visibleIds]);

  const allVisibleSelected
    = visibleIds.length > 0
      && visibleIds.every(id => selectedIds.has(id));
  const someVisibleSelected
    = !allVisibleSelected && visibleIds.some(id => selectedIds.has(id));

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      visibleIds.forEach(id => next.add(id));
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return {
    selectedIds,
    setSelectedIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleSelected,
    toggleSelectAllVisible,
    clearSelection,
  };
}
