import type { DashboardLayout, DashboardTileId } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toggleTile } from "@/routes/dashboard.-components/-dashboardTileMeta";
import {
  createDashboardLayout,
  deleteSingleDashboardLayout,
  duplicateDashboardLayout,
  fetchDashboardLayouts,
  upsertDashboardLayout,
} from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

export type CreateKind = "tab" | "preset";

/**
 * Data + mutations for the dashboard-layouts settings section. Owns the dialog
 * target state alongside the mutations so each `onSuccess` can close its own
 * dialog; the section is left rendering from a presentational-ready return.
 */
export function useDashboardLayouts() {
  const queryClient = useQueryClient();

  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [saveAsTargetId, setSaveAsTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [creatingKind, setCreatingKind] = useState<CreateKind | null>(null);

  const layoutsQuery = useQuery({
    queryKey: queryKeys.dashboardLayouts.list(),
    queryFn: () => fetchDashboardLayouts(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardLayouts.list(),
    });

  const layouts = layoutsQuery.data ?? [];
  const tabs = layouts.filter(l => !l.isTemplate);
  const presets = layouts.filter(l => l.isTemplate);

  const renameTarget = layouts.find(l => l.id === renameTargetId) ?? null;
  const saveAsTarget = layouts.find(l => l.id === saveAsTargetId) ?? null;
  const deleteTarget = layouts.find(l => l.id === deleteTargetId) ?? null;

  const createMutation = useMutation({
    mutationFn: ({
      name, kind,
    }: { name: string;
      kind: CreateKind; }) =>
      createDashboardLayout({
        name,
        position: kind === "tab" ? tabs.length : null,
        tiles: [],
        isTemplate: kind === "preset",
      }),
    onSuccess: (_res, {
      kind,
    }) => {
      void invalidate();
      setCreatingKind(null);
      toast.success(kind === "preset" ? "Preset created" : "Layout created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({
      layout, name,
    }: { layout: DashboardLayout;
      name: string; }) =>
      upsertDashboardLayout(layout.id, {
        name,
        position: layout.position ?? null,
        tiles: layout.tiles,
        isTemplate: layout.isTemplate ?? false,
      }),
    onSuccess: () => {
      void invalidate();
      setRenameTargetId(null);
      toast.success("Layout renamed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const saveAsPresetMutation = useMutation({
    mutationFn: ({
      name, layout,
    }: { name: string;
      layout: DashboardLayout; }) =>
      createDashboardLayout({
        name,
        position: null,
        tiles: layout.tiles,
        isTemplate: true,
      }),
    onSuccess: () => {
      void invalidate();
      setSaveAsTargetId(null);
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
      setDeleteTargetId(null);
      toast.success("Layout deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleTileMutation = useMutation({
    mutationFn: ({
      layout, tileId,
    }: { layout: DashboardLayout;
      tileId: DashboardTileId; }) =>
      upsertDashboardLayout(layout.id, {
        name: layout.name,
        position: layout.position ?? null,
        tiles: toggleTile(layout.tiles, tileId),
        isTemplate: layout.isTemplate ?? false,
      }),
    onSuccess: () => {
      void invalidate();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const rowProps = {
    onToggleTile: (layout: DashboardLayout, tileId: DashboardTileId) =>
      toggleTileMutation.mutate({
        layout,
        tileId,
      }),
    onRename: (layout: DashboardLayout) => setRenameTargetId(layout.id),
    onDuplicate: (layout: DashboardLayout) => duplicateMutation.mutate(layout.id),
    onSaveAs: (layout: DashboardLayout) => setSaveAsTargetId(layout.id),
    onDelete: (layout: DashboardLayout) => setDeleteTargetId(layout.id),
  };

  return {
    isPending: layoutsQuery.isPending,
    tabs,
    presets,
    rowProps,

    creatingKind,
    startCreate: (kind: CreateKind) => setCreatingKind(kind),
    closeCreate: () => setCreatingKind(null),
    submitCreate: (name: string) => {
      if (creatingKind) {
        createMutation.mutate({
          name,
          kind: creatingKind,
        });
      }
    },
    isCreating: createMutation.isPending,

    renameTarget,
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
    closeSaveAs: () => setSaveAsTargetId(null),
    submitSaveAs: (name: string) => {
      if (saveAsTarget) {
        saveAsPresetMutation.mutate({
          name,
          layout: saveAsTarget,
        });
      }
    },
    isSavingPreset: saveAsPresetMutation.isPending,

    deleteTarget,
    closeDelete: () => setDeleteTargetId(null),
    confirmDelete: () => {
      if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
    },
  };
}
