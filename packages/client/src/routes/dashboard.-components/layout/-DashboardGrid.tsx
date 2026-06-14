import type { GridLayoutItem } from "@/lib/dashboardTiles";
import type { DashboardLayoutTile, DashboardTileId } from "@emstack/types";

import { useCallback, useMemo, useState } from "react";

import { DndGrid } from "@dnd-grid/react";

import { TILE_COMPONENTS } from "../-tileComponents";
import {
  applyGeometryToTiles,
  buildDisplayLayout,
  rootFontSizePx,
} from "./-gridLayout";
import { GridTile } from "./-GridTile";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  GRID_EM_PER_ROW,
  GRID_GAP,
  isAutoHeight,
  sortTilesForMobile,
} from "@/lib/dashboardTiles";

interface DashboardGridProps {
  tiles: DashboardLayoutTile[];
  onTilesChange: (tiles: DashboardLayoutTile[]) => void;
  onUpdateTile: (
    tileId: DashboardTileId,
    patch: Partial<DashboardLayoutTile>,
  ) => void;
}

/**
 * The 4-column drag-and-drop tile grid. Dragging is restricted to the card
 * headers; every tile resizes its width via a right-edge handle, and fixed-height
 * tiles additionally resize their height via the SE corner. Auto-height tiles
 * still grow to fit their content. On mobile the tiles render as a plain stack.
 */
export function DashboardGrid({
  tiles,
  onTilesChange,
  onUpdateTile,
}: DashboardGridProps) {
  const isMobile = useIsMobile();
  const [measured, setMeasured] = useState<Map<string, number>>(new Map());
  const rowHeightPx = useMemo(() => GRID_EM_PER_ROW * rootFontSizePx(), []);

  const handleMeasure = useCallback((tileId: DashboardTileId, rows: number) => {
    setMeasured((prev) => {
      if (prev.get(tileId) === rows) return prev;
      const nextMap = new Map(prev);
      nextMap.set(tileId, rows);
      return nextMap;
    });
  }, []);

  const layout = useMemo(
    () => buildDisplayLayout(tiles, measured),
    [tiles, measured],
  );

  if (tiles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        <i>All tiles are hidden. Enable some from the Tiles menu above.</i>
      </p>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {sortTilesForMobile(tiles).map((tile) => {
          const Tile = TILE_COMPONENTS[tile.tileId];
          return (
            <div
              key={tile.tileId}
              className="min-w-0"
            >
              <Tile
                tile={tile}
                onUpdateTile={patch => onUpdateTile(tile.tileId, patch)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Note: the layout/onLayoutChange props are typed with our own
  // GridLayoutItem shape — the package's published d.ts re-exports its core
  // types through a broken relative path, so its `Layout` resolves to `any`.
  return (
    <div className="**:data-[slot=dashboard-card-header]:cursor-grab">
      <DndGrid
        layout={layout}
        cols={4}
        rowHeight={rowHeightPx}
        gap={GRID_GAP}
        dragHandle="[data-slot=dashboard-card-header]"
        dragCancel="a, button, input, select, [role=menuitem]"
        resizeHandles={["se"]}
        onLayoutChange={(next: readonly GridLayoutItem[]) =>
          onTilesChange(applyGeometryToTiles(next, tiles))}
      >
        {layout.map((item) => {
          const tileId = item.id as DashboardTileId;
          const Tile = TILE_COMPONENTS[tileId];
          const tile = tiles.find(t => t.tileId === tileId);
          if (!tile) return null;
          return (
            <GridTile
              key={item.id}
              tileId={tileId}
              autoHeight={isAutoHeight(tile)}
              rowHeightPx={rowHeightPx}
              onMeasure={handleMeasure}
            >
              <Tile
                tile={tile}
                onUpdateTile={patch => onUpdateTile(tileId, patch)}
              />
            </GridTile>
          );
        })}
      </DndGrid>
    </div>
  );
}
