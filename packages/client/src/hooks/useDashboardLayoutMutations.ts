import type { DashboardLayout, DashboardLayoutTile } from "@emstack/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createDashboardLayout,
  deleteSingleDashboardLayout,
  duplicateDashboardLayout,
  upsertDashboardLayout,
} from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

interface UseDashboardLayoutMutationsOptions {
  /** Runs after a successful rename, before the toast — close the dialog here. */
  onRenamed?: () => void;
  /** Runs after a successful save-as-preset, before the toast. */
  onSavedAsPreset?: () => void;
  /** Runs after a successful delete, before the toast. */
  onDeleted?: () => void;
}

interface RenameInput {
  layout: DashboardLayout;
  name: string;
}

interface SaveAsPresetInput {
  name: string;
  tiles: DashboardLayoutTile[];
}

/**
 * The dashboard-layout CRUD mutations shared by the /dashboard route and the
 * settings layouts section (both via `useDashboardLayoutManager`): rename,
 * save-as-preset, duplicate, delete. Each invalidates the layouts list and shows
 * the same toast on both surfaces; the only per-call-site difference (closing a
 * dialog) is injected via callbacks.
 *
 * Create and tile-toggle are deliberately NOT here — they diverge between the
 * two surfaces (create's side effects/inputs differ; the dashboard toggles
 * optimistically while settings invalidates), so each keeps its own.
 */
export function useDashboardLayoutMutations(
  options: UseDashboardLayoutMutationsOptions = {},
) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardLayouts.list(),
    });

  const renameMutation = useMutation({
    mutationFn: ({
      layout, name,
    }: RenameInput) =>
      upsertDashboardLayout(layout.id, {
        name,
        position: layout.position ?? null,
        tiles: layout.tiles,
        isTemplate: layout.isTemplate ?? false,
      }),
    onSuccess: () => {
      void invalidate();
      options.onRenamed?.();
      toast.success("Layout renamed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const saveAsPresetMutation = useMutation({
    mutationFn: ({
      name, tiles,
    }: SaveAsPresetInput) =>
      createDashboardLayout({
        name,
        position: null,
        tiles,
        isTemplate: true,
      }),
    onSuccess: () => {
      void invalidate();
      options.onSavedAsPreset?.();
      toast.success("Saved as a layout you can reuse");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateDashboardLayout(id),
    onSuccess: () => {
      void invalidate();
      toast.success("Layout duplicated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSingleDashboardLayout(id),
    onSuccess: () => {
      void invalidate();
      options.onDeleted?.();
      toast.success("Layout deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    renameMutation,
    saveAsPresetMutation,
    duplicateMutation,
    deleteMutation,
  };
}
