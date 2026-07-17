import type { DashboardLayoutTile } from "@emstack/types";

import { useEffect, useMemo, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AddLayoutDialog,
  buildDefaultTiles,
  Button,
  DashboardGrid,
  LayoutManagerDialogs,
  LayoutTab,
  normalizeTiles,
  PageContainer,
  PageHeader,
  Tabs,
  TabsList,
  useDashboardTileSaver,
  VisibleTilesDialog,
} from "./-components";

import { useActiveDashboardLayoutId } from "@/hooks/useActiveDashboardLayoutId";
import { useDashboardLayoutManager } from "@/hooks/useDashboardLayoutManager";
import { createDashboardLayout } from "@/utils/api";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
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

  const {
    handleTilesChange,
    handleToggleTile,
    handleUpdateTile,
  } = useDashboardTileSaver({
    activeLayout,
    normalizedTiles,
    invalidate,
  });

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

      <LayoutManagerDialogs
        renameTarget={renameTarget}
        isRenaming={isRenaming}
        closeRename={closeRename}
        submitRename={submitRename}
        saveAsTarget={saveAsTarget}
        isSavingPreset={isSavingPreset}
        closeSaveAs={closeSaveAs}
        submitSaveAs={submitSaveAs}
        deleteTarget={deleteTarget}
        closeDelete={closeDelete}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
