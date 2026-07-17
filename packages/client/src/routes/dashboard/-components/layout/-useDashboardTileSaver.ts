import type {
  DashboardLayout,
  DashboardLayoutTile,
  DashboardTileId,
} from "@emstack/types";

import { useEffect, useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  needsNormalization,
  normalizeTiles,
  tilesEqual,
  toggleTile,
} from "@/lib/dashboardTiles";
import { upsertDashboardLayout } from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

const SAVE_DEBOUNCE_MS = 600;

interface UseDashboardTileSaverArgs {
  activeLayout: DashboardLayout | null;
  // The active layout's tiles after legacy-id normalization (what the grid renders).
  normalizedTiles: DashboardLayoutTile[];
  invalidate: () => Promise<void>;
}

// The dashboard's tile-persistence machinery: debounced saves for grid
// moves/resizes (optimistic cache write, no refetch mid-drag), immediate saves
// for tile toggles/patches, and a one-shot self-heal that persists normalized
// tiles when a layout still holds a legacy id.
export function useDashboardTileSaver({
  activeLayout,
  normalizedTiles,
  invalidate,
}: UseDashboardTileSaverArgs) {
  const queryClient = useQueryClient();

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

  return {
    handleTilesChange,
    handleToggleTile,
    handleUpdateTile,
  };
}
