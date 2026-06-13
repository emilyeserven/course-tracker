import type {
  DashboardTileProps,
  GridLayoutItem,
} from "./-dashboardTileMeta";
import type { DashboardLayoutTile, DashboardTileId } from "@emstack/types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DndGrid } from "@dnd-grid/react";

import { DashboardChangelog } from "./-DashboardChangelog";
import { DashboardCoursesByAmortization } from "./-DashboardCoursesByAmortization";
import { DashboardCoursesInProgress } from "./-DashboardCoursesInProgress";
import { DashboardDoneForDay, DashboardDoNow } from "./-DashboardDailies";
import { DashboardExplore } from "./-DashboardExplore";
import { DashboardGoogleCalendar } from "./-DashboardGoogleCalendar";
import { DashboardRadars } from "./-DashboardRadars";
import { DashboardReadwise } from "./-DashboardReadwise";
import {
  GRID_EM_PER_ROW,
  GRID_GAP,
  isAutoHeight,
  resizeHandlesForTile,
  rowsForContent,
  sortTilesForMobile,
  TILE_META,
  tilesToLayoutItems,
} from "./-dashboardTileMeta";
import { DashboardTodoist } from "./-DashboardTodoist";
import { DashboardUnderutilizedProviders } from "./-DashboardUnderutilizedProviders";

import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

const TILE_COMPONENTS: Record<
  DashboardTileId,
  React.ComponentType<DashboardTileProps>
> = {
  doNow: DashboardDoNow,
  doneForDay: DashboardDoneForDay,
  underutilizedProviders: DashboardUnderutilizedProviders,
  coursesByAmortization: DashboardCoursesByAmortization,
  coursesInProgress: DashboardCoursesInProgress,
  radars: DashboardRadars,
  exploreSomething: DashboardExplore,
  readwise: DashboardReadwise,
  todoist: DashboardTodoist,
  googleCalendar: DashboardGoogleCalendar,
  changelog: DashboardChangelog,
};

interface DashboardGridProps {
  tiles: DashboardLayoutTile[];
  onTilesChange: (tiles: DashboardLayoutTile[]) => void;
  onUpdateTile: (
    tileId: DashboardTileId,
    patch: Partial<DashboardLayoutTile>,
  ) => void;
}

/** Root font size in px, used to convert the 4em-per-row grid unit to pixels. */
function rootFontSizePx(): number {
  if (typeof window === "undefined") return 16;
  const parsed = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

/**
 * Builds the layout fed to the grid. Every tile is resizable and carries its own
 * handles (see `resizeHandlesForTile`): all tiles get a width-only east edge, and
 * fixed tiles also get the SE corner for height. Auto-height tiles take their
 * measured row count so the east-edge drag only ever changes their width.
 */
function buildDisplayLayout(
  tiles: DashboardLayoutTile[],
  measured: Map<string, number>,
): GridLayoutItem[] {
  return tilesToLayoutItems(tiles).map((item) => {
    if (!isAutoHeight(item)) {
      return {
        ...item,
        resizable: true,
        resizeHandles: resizeHandlesForTile(item),
      };
    }
    return {
      ...item,
      h: measured.get(item.id) ?? item.h,
      resizable: true,
      resizeHandles: resizeHandlesForTile(item),
    };
  });
}

/**
 * Fold the grid's geometry changes back onto the persisted tiles. Only x/y/w
 * (and, for fixed tiles, h) are taken from the grid; per-tile settings come
 * from the persisted tile so they can't be lost if the grid drops custom
 * fields, and an auto tile's content-driven height is never written back.
 */
function applyGeometryToTiles(
  next: readonly GridLayoutItem[],
  persisted: DashboardLayoutTile[],
): DashboardLayoutTile[] {
  const byId = new Map(persisted.map(t => [t.tileId as string, t]));
  const result: DashboardLayoutTile[] = [];
  for (const item of next) {
    const prev = byId.get(item.id);
    if (!prev) continue;
    result.push({
      ...prev,
      x: item.x,
      y: item.y,
      w: item.w,
      h: isAutoHeight(prev) ? prev.h : item.h,
    });
  }
  return result;
}

/**
 * Wraps a single tile. Auto-height tiles render at their natural height and
 * report it (via ResizeObserver) so the grid can size their row span; fixed
 * tiles fill the grid cell and scroll internally.
 *
 * The grid clones this element to inject the `dnd-grid-item` class, the inline
 * geometry style, drag handlers, and its own ref — so we must forward every
 * received prop (and merge its ref with our measuring ref). Swallowing them
 * leaves tiles unpositioned, undraggable, and with stray always-on handles.
 *
 * One exception: the grid's geometry `style` carries a fixed pixel `height`
 * (the layout row count × rowHeight). For auto-height tiles that height must
 * not reach the measured element — it would feed the element's own height back
 * into the ResizeObserver (freezing the row count) and let taller content
 * overflow into the tile below. So we keep position/transform/width but drop
 * the imposed height for auto tiles, letting them size to their content.
 */
export function GridTile({
  tileId,
  autoHeight,
  rowHeightPx,
  onMeasure,
  className,
  style,
  ref,
  children,
  ...props
}: {
  tileId: DashboardTileId;
  autoHeight: boolean;
  rowHeightPx: number;
  onMeasure: (tileId: DashboardTileId, rows: number) => void;
} & React.ComponentProps<"div">) {
  const innerRef = useRef<HTMLDivElement>(null);
  const minH = TILE_META[tileId].minH;

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    if (!autoHeight) return;
    const el = innerRef.current;
    if (!el) return;
    const measure = () =>
      onMeasure(tileId, rowsForContent(el.offsetHeight, rowHeightPx, minH));
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [autoHeight, tileId, rowHeightPx, minH, onMeasure]);

  // Drop the grid's imposed height for auto tiles so the measured element
  // sizes to its content (see the note above); fixed tiles keep it.
  const itemStyle = autoHeight && style
    ? {
      ...style,
      height: undefined,
    }
    : style;

  return (
    <div
      ref={setRef}
      className={cn("min-w-0", !autoHeight && `
        h-full min-h-0
        *:h-full
      `, className)}
      {...props}
      style={itemStyle}
    >
      {children}
    </div>
  );
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
