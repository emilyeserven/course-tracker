import type { DashboardLayout, DashboardTileId } from "@emstack/types";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDashboardLayoutManager } from "@/hooks/useDashboardLayoutManager";
import { toggleTile } from "@/lib/dashboardTiles";
import { createDashboardLayout, upsertDashboardLayout } from "@/utils/api";

export type CreateKind = "tab" | "preset";

/**
 * Data + mutations for the dashboard-layouts settings section. Wraps the shared
 * `useDashboardLayoutManager` (query + rename/save-as/delete dialogs) and layers
 * on the settings-only create (tab or preset) and per-row tile toggle, returning
 * a presentational-ready shape for the section to render.
 */
export function useDashboardLayouts() {
  const {
    isPending,
    tabs,
    presets,
    invalidate,
    duplicateMutation,
    renameTarget,
    openRename,
    closeRename,
    submitRename,
    isRenaming,
    saveAsTarget,
    openSaveAs,
    closeSaveAs,
    submitSaveAs,
    isSavingPreset,
    deleteTarget,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useDashboardLayoutManager();

  const [creatingKind, setCreatingKind] = useState<CreateKind | null>(null);

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

  const toggleTileMutation = useMutation({
    mutationFn: ({
      layout,
      tileId,
    }: {
      layout: DashboardLayout;
      tileId: DashboardTileId;
    }) =>
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
    onRename: (layout: DashboardLayout) => openRename(layout.id),
    onDuplicate: (layout: DashboardLayout) =>
      duplicateMutation.mutate(layout.id),
    onSaveAs: (layout: DashboardLayout) => openSaveAs(layout.id),
    onDelete: (layout: DashboardLayout) => openDelete(layout.id),
  };

  return {
    isPending,
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
    closeRename,
    submitRename,
    isRenaming,

    saveAsTarget,
    closeSaveAs,
    submitSaveAs,
    isSavingPreset,

    deleteTarget,
    closeDelete,
    confirmDelete,
  };
}
