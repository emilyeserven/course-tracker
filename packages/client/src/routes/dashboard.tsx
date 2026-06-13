import type { DashboardLayout, DashboardLayoutTile } from "@emstack/types";

import { useEffect, useRef, useState } from "react";

import { DASHBOARD_TILE_IDS } from "@emstack/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import { DashboardGrid } from "./dashboard.-components/-DashboardGrid";
import {
  buildDefaultTiles,
  tilesEqual,
  TILE_META,
  toggleTile,
} from "./dashboard.-components/-dashboardTileMeta";

import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutNameDialog } from "@/components/LayoutNameDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveDashboardLayoutId } from "@/hooks/useActiveDashboardLayoutId";
import { createDashboardLayout, fetchDashboardLayouts, upsertDashboardLayout } from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const SAVE_DEBOUNCE_MS = 600;

function Dashboard() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const {
    data: layouts,
    isPending,
    error,
  } = useQuery({
    queryKey: queryKeys.dashboardLayouts.list(),
    queryFn: () => fetchDashboardLayouts(),
  });

  const {
    activeId, setActiveId,
  } = useActiveDashboardLayoutId(layouts);
  const activeLayout = layouts?.find(l => l.id === activeId) ?? null;

  const createLayoutMutation = useMutation({
    mutationFn: ({
      name, tiles,
    }: { name: string;
      tiles: DashboardLayoutTile[]; }) =>
      createDashboardLayout({
        name,
        position: layouts?.length ?? 0,
        tiles,
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardLayouts.list(),
      });
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
  } = createLayoutMutation;
  useEffect(() => {
    if (layouts && layouts.length === 0 && !autoCreatedRef.current) {
      autoCreatedRef.current = true;
      autoCreate({
        name: "Default",
        tiles: buildDefaultTiles(),
      });
    }
  }, [layouts, autoCreate]);

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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardLayouts.list(),
      });
    },
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const handleTilesChange = (tiles: DashboardLayoutTile[]) => {
    // Ignore the grid's mount/compaction echoes — only real moves save.
    if (!activeLayout || tilesEqual(tiles, activeLayout.tiles)) return;
    clearTimeout(saveTimerRef.current);
    const layout = activeLayout;
    saveTimerRef.current = setTimeout(() => {
      saveTilesMutation.mutate({
        layout,
        tiles,
      });
    }, SAVE_DEBOUNCE_MS);
  };

  const handleToggleTile = (tileId: (typeof DASHBOARD_TILE_IDS)[number]) => {
    if (!activeLayout) return;
    clearTimeout(saveTimerRef.current);
    saveTilesMutation.mutate({
      layout: activeLayout,
      tiles: toggleTile(activeLayout.tiles, tileId),
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
        {activeLayout && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tabs
                  value={activeLayout.id}
                  onValueChange={setActiveId}
                >
                  <TabsList>
                    {layouts?.map(layout => (
                      <TabsTrigger
                        key={layout.id}
                        value={layout.id}
                      >
                        {layout.name}
                      </TabsTrigger>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <SlidersHorizontalIcon />
                    Tiles
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Visible tiles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {DASHBOARD_TILE_IDS.map(tileId => (
                    <DropdownMenuCheckboxItem
                      key={tileId}
                      checked={activeLayout.tiles.some(t => t.tileId === tileId)}
                      onCheckedChange={() => handleToggleTile(tileId)}
                      onSelect={e => e.preventDefault()}
                    >
                      {TILE_META[tileId].title}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <DashboardGrid
              tiles={activeLayout.tiles}
              onTilesChange={handleTilesChange}
            />
          </>
        )}
      </div>
      <LayoutNameDialog
        open={addDialogOpen}
        title="Add layout"
        submitLabel="Add"
        isSaving={createLayoutMutation.isPending}
        onOpenChange={setAddDialogOpen}
        onSubmit={name =>
          createLayoutMutation.mutate({
            name,
            tiles: activeLayout?.tiles ?? buildDefaultTiles(),
          })}
      />
    </div>
  );
}
