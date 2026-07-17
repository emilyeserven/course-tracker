import type {
  DashboardLayout,
  DashboardLayoutTile,
  DashboardTileId,
} from "@emstack/types";

import { useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AddLayoutDialog,
  buildDefaultTiles,
  Button,
  ConfirmDialog,
  DashboardGrid,
  LayoutNameDialog,
  LayoutTab,
  needsNormalization,
  normalizeTiles,
  PageContainer,
  PageHeader,
  Tabs,
  TabsList,
  tilesEqual,
  toggleTile,
  VisibleTilesDialog,
} from "./-components";

import { useActiveDashboardLayoutId } from "@/hooks/useActiveDashboardLayoutId";
import { useDashboardLayoutManager } from "@/hooks/useDashboardLayoutManager";
import { createDashboardLayout, upsertDashboardLayout } from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const SAVE_DEBOUNCE_MS = 600;

function Dashboard() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [tilesTargetId, setTilesTargetId] = useState<string | null>(null);

  const {
    layouts,
    tabs,
    presets,
    isPending,
    error,
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

  const {
    activeId, setActiveId,
  } = useActiveDashboardLayoutId(tabs);
  const activeLayout = tabs.find(l => l.id === activeId) ?? null;

  // Migrate legacy layouts (a single `dailies` tile becomes Do Now + Done for
  // the Day) at read time so the grid and Tiles menu always see current ids.
  const normalizedTiles = useMemo(
    () => (activeLayout ? normalizeTiles(activeLayout.tiles) : []),
    [activeLayout],
  );

  const tilesTarget = layouts.find(l => l.id === tilesTargetId) ?? null;

  const createTabMutation = useMutation({
    mutationFn: ({
      name,
      tiles,
    }: {
      name: string;
      tiles: DashboardLayoutTile[];
    }) =>
      createDashboardLayout({
        name,
        position: tabs.length,
        tiles,
        isTemplate: false,
      }),
    onSuccess: async (res) => {
      await invalidate();
      setActiveId(res.id);
      setAddDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // First visit on an empty database: create the "Default" layout that
  // replicates the pre-grid dashboard. Wait for a settled, successful load so a
  // still-loading (or errored) query can't trigger a spurious create, and
  // ref-guard so StrictMode's double effect run can't create two rows.
  const autoCreatedRef = useRef(false);
  const {
    mutate: autoCreate,
  } = createTabMutation;
  useEffect(() => {
    if (isPending || error != null) return;
    if (layouts.length === 0 && !autoCreatedRef.current) {
      autoCreatedRef.current = true;
      autoCreate({
        name: "Default",
        tiles: buildDefaultTiles(),
      });
    }
  }, [isPending, error, layouts, autoCreate]);

  // Tile moves/resizes save through an optimistic cache write with no
  // invalidate on success — a refetch mid-drag would snap tiles back.
  const saveTilesMutation = useMutation({
    mutationFn: ({
      layout,
      tiles,
    }: {
      layout: DashboardLayout;
      tiles: DashboardLayoutTile[];
    }) =>
      upsertDashboardLayout(layout.id, {
        name: layout.name,
        position: layout.position ?? null,
        tiles,
        isTemplate: layout.isTemplate ?? false,
      }),
    onMutate: ({
      layout, tiles,
    }) => {
      queryClient.setQueryData<DashboardLayout[]>(
        queryKeys.dashboardLayouts.list(),
        prev =>
          prev?.map(l =>
            l.id === layout.id
              ? {
                ...l,
                tiles,
              }
              : l),
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
      void invalidate();
    },
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  // Self-heal: persist the normalized tiles once when a layout still holds a
  // legacy id, so the database catches up even without a manual drag/resize.
  const healedRef = useRef<Set<string>>(new Set());
  const {
    mutate: saveTiles,
  } = saveTilesMutation;
  useEffect(() => {
    if (!activeLayout || !needsNormalization(activeLayout.tiles)) return;
    if (healedRef.current.has(activeLayout.id)) return;
    healedRef.current.add(activeLayout.id);
    saveTiles({
      layout: activeLayout,
      tiles: normalizeTiles(activeLayout.tiles),
    });
  }, [activeLayout, saveTiles]);

  const handleTilesChange = (tiles: DashboardLayoutTile[]) => {
    // Ignore the grid's mount/compaction echoes — only real moves save.
    if (!activeLayout || tilesEqual(tiles, normalizedTiles)) return;
    clearTimeout(saveTimerRef.current);
    const layout = activeLayout;
    saveTimerRef.current = setTimeout(() => {
      saveTilesMutation.mutate({
        layout,
        tiles,
      });
    }, SAVE_DEBOUNCE_MS);
  };

  const handleToggleTile = (
    layout: DashboardLayout,
    tileId: DashboardTileId,
  ) => {
    clearTimeout(saveTimerRef.current);
    saveTilesMutation.mutate({
      layout,
      tiles: toggleTile(normalizeTiles(layout.tiles), tileId),
    });
  };

  const handleUpdateTile = (
    tileId: DashboardTileId,
    patch: Partial<DashboardLayoutTile>,
  ) => {
    if (!activeLayout) return;
    clearTimeout(saveTimerRef.current);
    saveTilesMutation.mutate({
      layout: activeLayout,
      tiles: normalizedTiles.map(t =>
        t.tileId === tileId
          ? {
            ...t,
            ...patch,
          }
          : t),
    });
  };

  return (
    <div>
      <PageHeader pageTitle="Dashboard" />
      <PageContainer className="flex flex-col gap-3">
        {isPending && (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        )}
        {!isPending && error != null && (
          <p className="text-sm text-destructive">
            Failed to load dashboard layouts.
          </p>
        )}
        {!isPending && error == null && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs
                value={activeId ?? ""}
                onValueChange={setActiveId}
              >
                <TabsList>
                  {tabs.map(layout => (
                    <LayoutTab
                      key={layout.id}
                      layout={layout}
                      onEditTiles={l => setTilesTargetId(l.id)}
                      onRename={l => openRename(l.id)}
                      onDuplicate={l => duplicateMutation.mutate(l.id)}
                      onSaveAs={l => openSaveAs(l.id)}
                      onDelete={l => openDelete(l.id)}
                    />
                  ))}
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                title="Add layout"
                onClick={() => setAddDialogOpen(true)}
              >
                <PlusIcon />
              </Button>
            </div>
            {activeLayout
              ? (
                <DashboardGrid
                  tiles={normalizedTiles}
                  onTilesChange={handleTilesChange}
                  onUpdateTile={handleUpdateTile}
                />
              )
              : (
                <p className="text-sm text-muted-foreground">
                  No layout selected. Add one to get started.
                </p>
              )}
          </>
        )}
      </PageContainer>

      <VisibleTilesDialog
        open={tilesTarget !== null}
        layout={tilesTarget}
        onToggleTile={handleToggleTile}
        onOpenChange={(open) => {
          if (!open) setTilesTargetId(null);
        }}
      />

      <AddLayoutDialog
        open={addDialogOpen}
        isSaving={createTabMutation.isPending}
        savedPresets={presets}
        onOpenChange={setAddDialogOpen}
        onSubmit={(name, tiles) =>
          createTabMutation.mutate({
            name,
            tiles: normalizeTiles(tiles),
          })}
      />

      <LayoutNameDialog
        open={renameTarget !== null}
        title="Rename layout"
        initialName={renameTarget?.name ?? ""}
        isSaving={isRenaming}
        onOpenChange={(open) => {
          if (!open) closeRename();
        }}
        onSubmit={submitRename}
      />

      <LayoutNameDialog
        open={saveAsTarget !== null}
        title="Save as layout"
        submitLabel="Save"
        initialName={saveAsTarget?.name ?? ""}
        isSaving={isSavingPreset}
        onOpenChange={(open) => {
          if (!open) closeSaveAs();
        }}
        onSubmit={submitSaveAs}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete layout?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
