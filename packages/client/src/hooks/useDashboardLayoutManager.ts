import { useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useDashboardLayoutMutations } from "@/hooks/useDashboardLayoutMutations";
import { fetchDashboardLayouts } from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Shared dashboard-layout data + dialog orchestration for the /dashboard route
 * and the settings layouts section. Owns the layouts query, the tabs/presets
 * split, and the rename/save-as/delete dialog targets wired to
 * `useDashboardLayoutMutations` so each `onSuccess` closes its own dialog.
 *
 * Create and tile-toggle deliberately stay with each caller — they diverge (see
 * `useDashboardLayoutMutations`): the dashboard creates a tab with tiles + selects
 * it and toggles optimistically, while settings creates a tab-or-preset and
 * toggles via invalidate.
 */
export function useDashboardLayoutManager() {
  const queryClient = useQueryClient();

  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [saveAsTargetId, setSaveAsTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const layoutsQuery = useQuery({
    queryKey: queryKeys.dashboardLayouts.list(),
    queryFn: () => fetchDashboardLayouts(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardLayouts.list(),
    });

  const layouts = layoutsQuery.data ?? [];

  // Tabs are the non-template layouts; presets are offered as starting points
  // when adding a tab and never appear in the strip. Memoized on the raw query
  // data so the references stay stable across renders (a `?? []` fallback would
  // be a fresh array every loading render and defeat the memo).
  const tabs = useMemo(
    () => layoutsQuery.data?.filter(l => !l.isTemplate) ?? [],
    [layoutsQuery.data],
  );
  const presets = useMemo(
    () => layoutsQuery.data?.filter(l => l.isTemplate) ?? [],
    [layoutsQuery.data],
  );

  const renameTarget = layouts.find(l => l.id === renameTargetId) ?? null;
  const saveAsTarget = layouts.find(l => l.id === saveAsTargetId) ?? null;
  const deleteTarget = layouts.find(l => l.id === deleteTargetId) ?? null;

  const {
    renameMutation,
    saveAsPresetMutation,
    duplicateMutation,
    deleteMutation,
  } = useDashboardLayoutMutations({
    onRenamed: () => setRenameTargetId(null),
    onSavedAsPreset: () => setSaveAsTargetId(null),
    onDeleted: () => setDeleteTargetId(null),
  });

  return {
    layouts,
    tabs,
    presets,
    isPending: layoutsQuery.isPending,
    error: layoutsQuery.error,
    invalidate,
    duplicateMutation,

    renameTarget,
    openRename: (id: string) => setRenameTargetId(id),
    closeRename: () => setRenameTargetId(null),
    submitRename: (name: string) => {
      if (renameTarget) {
        renameMutation.mutate({
          layout: renameTarget,
          name,
        });
      }
    },
    isRenaming: renameMutation.isPending,

    saveAsTarget,
    openSaveAs: (id: string) => setSaveAsTargetId(id),
    closeSaveAs: () => setSaveAsTargetId(null),
    submitSaveAs: (name: string) => {
      if (saveAsTarget) {
        saveAsPresetMutation.mutate({
          name,
          tiles: saveAsTarget.tiles,
        });
      }
    },
    isSavingPreset: saveAsPresetMutation.isPending,

    deleteTarget,
    openDelete: (id: string) => setDeleteTargetId(id),
    closeDelete: () => setDeleteTargetId(null),
    confirmDelete: () => {
      if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
    },
  };
}
