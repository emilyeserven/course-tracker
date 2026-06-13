import type { GridLayoutItem } from "./-dashboardTileMeta";
import type { DashboardLayoutTile, DashboardTileId } from "@emstack/types";

import { DndGrid } from "@dnd-grid/react";

import { DashboardChangelog } from "./-DashboardChangelog";
import { DashboardCoursesByAmortization } from "./-DashboardCoursesByAmortization";
import { DashboardCoursesInProgress } from "./-DashboardCoursesInProgress";
import { DashboardDailies } from "./-DashboardDailies";
import { DashboardExplore } from "./-DashboardExplore";
import { DashboardRadars } from "./-DashboardRadars";
import { DashboardReadwise } from "./-DashboardReadwise";
import {
  layoutItemsToTiles,
  sortTilesForMobile,
  tilesToLayoutItems,
} from "./-dashboardTileMeta";
import { DashboardTodoist } from "./-DashboardTodoist";
import { DashboardUnderutilizedProviders } from "./-DashboardUnderutilizedProviders";

import { useIsMobile } from "@/hooks/useIsMobile";

const TILE_COMPONENTS: Record<DashboardTileId, React.ComponentType> = {
  dailies: DashboardDailies,
  underutilizedProviders: DashboardUnderutilizedProviders,
  coursesByAmortization: DashboardCoursesByAmortization,
  coursesInProgress: DashboardCoursesInProgress,
  radars: DashboardRadars,
  exploreSomething: DashboardExplore,
  readwise: DashboardReadwise,
  todoist: DashboardTodoist,
  changelog: DashboardChangelog,
};

interface DashboardGridProps {
  tiles: DashboardLayoutTile[];
  onTilesChange: (tiles: DashboardLayoutTile[]) => void;
}

/**
 * The 4-column drag-and-drop tile grid. Dragging is restricted to the card
 * headers; resizing uses the default SE handle. On mobile the tiles render
 * as a plain stack in reading order instead.
 */
export function DashboardGrid({
  tiles,
  onTilesChange,
}: DashboardGridProps) {
  const isMobile = useIsMobile();

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
        {sortTilesForMobile(tiles).map(({
          tileId,
        }) => {
          const Tile = TILE_COMPONENTS[tileId];
          return (
            <div
              key={tileId}
              className="min-w-0"
            >
              <Tile />
            </div>
          );
        })}
      </div>
    );
  }

  // Note: the layout/onLayoutChange props are typed with our own
  // GridLayoutItem shape — the package's published d.ts re-exports its core
  // types through a broken relative path, so its `Layout` resolves to `any`.
  const layout = tilesToLayoutItems(tiles);

  return (
    <div className="**:data-[slot=dashboard-card-header]:cursor-grab">
      <DndGrid
        layout={layout}
        cols={4}
        rowHeight={50}
        gap={12}
        dragHandle="[data-slot=dashboard-card-header]"
        dragCancel="a, button, input, select, [role=menuitem]"
        resizeHandles={["se"]}
        onLayoutChange={(next: readonly GridLayoutItem[]) =>
          onTilesChange(layoutItemsToTiles(next))}
      >
        {layout.map((item) => {
          const Tile = TILE_COMPONENTS[item.id as DashboardTileId];
          return (
            <div
              key={item.id}
              className="
                h-full min-h-0
                *:h-full
              "
            >
              <Tile />
            </div>
          );
        })}
      </DndGrid>
    </div>
  );
}
