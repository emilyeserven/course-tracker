import type { DashboardLayout, DashboardLayoutTile, DashboardTileId } from "@emstack/types";

import { useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookmarkIcon,
  CopyIcon,
  LayoutGridIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { AddLayoutDialog } from "./dashboard.-components/-AddLayoutDialog";
import { DashboardGrid } from "./dashboard.-components/-DashboardGrid";
import {
  buildDefaultTiles,
  needsNormalization,
  normalizeTiles,
  tilesEqual,
  toggleTile,
} from "./dashboard.-components/-dashboardTileMeta";
import { VisibleTilesDialog } from "./dashboard.-components/-VisibleTilesDialog";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutNameDialog } from "@/components/LayoutNameDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveDashboardLayoutId } from "@/hooks/useActiveDashboardLayoutId";
import {
  createDashboardLayout,
  deleteSingleDashboardLayout,
  duplicateDashboardLayout,
  fetchDashboardLayouts,
  upsertDashboardLayout,
} from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const SAVE_DEBOUNCE_MS = 600;

interface LayoutTabProps {
  layout: DashboardLayout;
  onEditTiles: (layout: DashboardLayout) => void;
  onRename: (layout: DashboardLayout) => void;
  onDuplicate: (layout: DashboardLayout) => void;
  onSaveAs: (layout: DashboardLayout) => void;
  onDelete: (layout: DashboardLayout) => void;
}

/** A dashboard tab plus its hover-revealed "More" menu. The trigger is a
 * sibling of the Radix TabsTrigger (never nested, which would be invalid
 * button-in-button) and is always visible on touch where hover doesn't fire. */
function LayoutTab({
  layout,
  onEditTiles,
  onRename,
  onDuplicate,
  onSaveAs,
  onDelete,
}: LayoutTabProps) {
  return (
    <div className="group relative">
      <TabsTrigger
        value={layout.id}
        className="pr-8"
      >
        {layout.name}
      </TabsTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${layout.name} options`}
            onClick={e => e.stopPropagation()}
            className="
              absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center
              justify-center rounded-sm text-muted-foreground opacity-0
              transition-opacity
              group-focus-within:opacity-100
              group-hover:opacity-100
              hover:bg-background/60 hover:text-foreground
              focus-visible:opacity-100
              max-md:opacity-100
            "
          >
            <MoreHorizontalIcon className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEditTiles(layout)}>
            <LayoutGridIcon />
            Visible tiles…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onRename(layout)}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDuplicate(layout)}>
            <CopyIcon />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSaveAs(layout)}>
            <BookmarkIcon />
            Save as layout…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDelete(layout)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Dashboard() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [tilesTargetId, setTilesTargetId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [saveAsTargetId, setSaveAsTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const {
    data: layouts,
    isPending,
    error,
  } = useQuery({
    queryKey: queryKeys.dashboardLayouts.list(),
    queryFn: () => fetchDashboardLayouts(),
  });

  // Tabs are the non-template layouts; presets are offered as starting points
  // when adding a tab and never appear in the strip.
  const tabs = useMemo(
    () => layouts?.filter(l => !l.isTemplate) ?? [],
    [layouts],
  );
  const presets = useMemo(
    () => layouts?.filter(l => l.isTemplate) ?? [],
    [layouts],
  );

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

  const tilesTarget = layouts?.find(l => l.id === tilesTargetId) ?? null;
  const renameTarget = layouts?.find(l => l.id === renameTargetId) ?? null;
  const saveAsTarget = layouts?.find(l => l.id === saveAsTargetId) ?? null;
  const deleteTarget = layouts?.find(l => l.id === deleteTargetId) ?? null;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardLayouts.list(),
    });

  const createTabMutation = useMutation({
    mutationFn: ({
      name, tiles,
    }: { name: string;
      tiles: DashboardLayoutTile[]; }) =>
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
  // replicates the pre-grid dashboard. Ref-guarded so StrictMode's double
  // effect run can't create two rows.
  const autoCreatedRef = useRef(false);
  const {
    mutate: autoCreate,
  } = createTabMutation;
  useEffect(() => {
    if (layouts && layouts.length === 0 && !autoCreatedRef.current) {
      autoCreatedRef.current = true;
      autoCreate({
        name: "Default",
        tiles: buildDefaultTiles(),
      });
    }
  }, [layouts, autoCreate]);

  const saveAsPresetMutation = useMutation({
    mutationFn: ({
      name, tiles,
    }: { name: string;
      tiles: DashboardLayoutTile[]; }) =>
      createDashboardLayout({
        name,
        position: null,
        tiles,
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

  // Tile moves/resizes save through an optimistic cache write with no
  // invalidate on success — a refetch mid-drag would snap tiles back.
  const saveTilesMutation = useMutation({
    mutationFn: ({
      layout, tiles,
    }: { layout: DashboardLayout;
      tiles: DashboardLayoutTile[]; }) =>
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
        prev => prev?.map(l =>
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

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
      <div className="container flex flex-col gap-3">
        {isPending && (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        )}
        {!isPending && error != null && (
          <p className="text-sm text-destructive">
            Failed to load dashboard layouts.
          </p>
        )}
        {!isPending && error == null && layouts != null && (
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
                      onRename={l => setRenameTargetId(l.id)}
                      onDuplicate={l => duplicateMutation.mutate(l.id)}
                      onSaveAs={l => setSaveAsTargetId(l.id)}
                      onDelete={l => setDeleteTargetId(l.id)}
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
      </div>

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
        isSaving={renameMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setRenameTargetId(null);
        }}
        onSubmit={(name) => {
          if (renameTarget) {
            renameMutation.mutate({
              layout: renameTarget,
              name,
            });
          }
        }}
      />

      <LayoutNameDialog
        open={saveAsTarget !== null}
        title="Save as layout"
        submitLabel="Save"
        initialName={saveAsTarget?.name ?? ""}
        isSaving={saveAsPresetMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSaveAsTargetId(null);
        }}
        onSubmit={(name) => {
          if (saveAsTarget) {
            saveAsPresetMutation.mutate({
              name,
              tiles: saveAsTarget.tiles,
            });
          }
        }}
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
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
