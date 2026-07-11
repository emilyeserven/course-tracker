import type {
  DailyTrackerColumnVisibility,
  DashboardLayout,
  DashboardLayoutTile,
  DashboardTileId,
} from "@emstack/types";

import { DASHBOARD_TILE_IDS } from "@emstack/types";

// Pure layout helpers for the dashboard grid — no component imports, so the
// module stays unit-testable. The component map lives in -DashboardGrid.tsx.

/** Props every dashboard tile component receives from the grid. */
export interface DashboardTileProps {
  tile: DashboardLayoutTile;
  /** Merge a settings patch into this tile and persist it. */
  onUpdateTile: (patch: Partial<DashboardLayoutTile>) => void;
}

export interface DashboardTileMeta {
  title: string;
  minW: number;
  minH: number;
}

export const TILE_META: Record<DashboardTileId, DashboardTileMeta> = {
  doNow: {
    title: "Do Now",
    minW: 1,
    minH: 4,
  },
  doneForDay: {
    title: "Done for the Day",
    minW: 1,
    minH: 4,
  },
  underutilizedProviders: {
    title: "Underutilized Providers",
    minW: 1,
    minH: 4,
  },
  coursesByAmortization: {
    title: "Cost per Unit",
    minW: 1,
    minH: 4,
  },
  coursesInProgress: {
    title: "Resources in Progress",
    minW: 1,
    minH: 4,
  },
  readwise: {
    title: "Readwise",
    minW: 1,
    minH: 4,
  },
  todoist: {
    title: "Todoist",
    minW: 1,
    minH: 4,
  },
  googleCalendar: {
    title: "Google Calendar",
    minW: 1,
    minH: 4,
  },
  changelog: {
    title: "Changelog",
    minW: 1,
    minH: 4,
  },
};

// The grid `h` unit maps to 4em per row (see GRID_EM_PER_ROW), and rows are
// separated by GRID_GAP pixels. Auto-height tiles convert their measured pixel
// height into the smallest number of rows that fits.
export const GRID_EM_PER_ROW = 4;
export const GRID_GAP = 12;

/** Upper bound for a manually-entered fixed tile height, in grid rows. */
export const MAX_TILE_ROWS = 40;

function isDashboardTileId(id: string): id is DashboardTileId {
  return (DASHBOARD_TILE_IDS as readonly string[]).includes(id);
}

/** Whether a tile's height is content-driven (auto) rather than handle-driven. */
export function isAutoHeight(
  tile: Pick<DashboardLayoutTile, "heightMode">,
): boolean {
  return (tile.heightMode ?? "auto") === "auto";
}

/** Mirrors @dnd-grid's ResizeHandleAxis; its published d.ts re-exports the core
 * types through a broken relative path, so the imported type resolves to `any`
 * (the same reason GridLayoutItem below is hand-rolled). */
export type ResizeHandleAxis
  = | "s"
    | "w"
    | "e"
    | "n"
    | "sw"
    | "nw"
    | "se"
    | "ne";

/**
 * Resize handles a tile exposes. Every tile gets the east (right-edge) handle so
 * its width is always adjustable; fixed-height tiles additionally get the SE
 * corner so the same drag can set their height. Auto-height tiles omit the corner
 * because their height is content-driven, not handle-driven.
 */
export function resizeHandlesForTile(
  tile: Pick<DashboardLayoutTile, "heightMode">,
): ResizeHandleAxis[] {
  return isAutoHeight(tile) ? ["e"] : ["e", "se"];
}

/**
 * Smallest row count (`h`) whose pixel height fits `contentPx`, given the row
 * height and the inter-row gap. Clamped to `minH`.
 */
export function rowsForContent(
  contentPx: number,
  rowHeightPx: number,
  minH: number,
): number {
  if (rowHeightPx <= 0) return minH;
  const rows = Math.ceil((contentPx + GRID_GAP) / (rowHeightPx + GRID_GAP));
  return Math.max(minH, rows);
}

// Every tile starts full-width (spanning all 4 columns) and stacked top to
// bottom. Users narrow a tile by dragging the resize handle in its bottom-right
// corner, which lets the grid pack the freed space with the next tile.
const DEFAULT_TILE_HEIGHTS: { tileId: DashboardTileId;
  h: number; }[] = [
  {
    tileId: "doNow",
    h: 6,
  },
  {
    tileId: "doneForDay",
    h: 5,
  },
  {
    tileId: "todoist",
    h: 7,
  },
  {
    tileId: "coursesInProgress",
    h: 7,
  },
  {
    tileId: "underutilizedProviders",
    h: 7,
  },
  {
    tileId: "coursesByAmortization",
    h: 7,
  },
  {
    tileId: "readwise",
    h: 7,
  },
  {
    tileId: "googleCalendar",
    h: 7,
  },
  {
    tileId: "changelog",
    h: 8,
  },
];

/** Full-width tiles stacked top to bottom, the dailies cards first. */
export function buildDefaultTiles(): DashboardLayoutTile[] {
  let y = 0;
  return DEFAULT_TILE_HEIGHTS.map(({
    tileId, h,
  }) => {
    const tile: DashboardLayoutTile = {
      tileId,
      x: 0,
      y,
      w: 4,
      h,
    };
    y += h;
    return tile;
  });
}

/**
 * Migrate legacy layouts: a single `dailies` tile (which used to render both the
 * Do Now and Done for the Day cards) becomes two stacked tiles. Also drops any
 * tiles with ids the client no longer knows about.
 */
export function normalizeTiles(
  tiles: DashboardLayoutTile[],
): DashboardLayoutTile[] {
  const result: DashboardLayoutTile[] = [];
  for (const tile of tiles) {
    if ((tile.tileId as string) === "dailies") {
      const topH = Math.max(TILE_META.doNow.minH, Math.ceil(tile.h / 2));
      const bottomH = Math.max(TILE_META.doneForDay.minH, tile.h - topH);
      result.push({
        tileId: "doNow",
        x: tile.x,
        y: tile.y,
        w: tile.w,
        h: topH,
      });
      result.push({
        tileId: "doneForDay",
        x: tile.x,
        y: tile.y + topH,
        w: tile.w,
        h: bottomH,
      });
    }
    else if (isDashboardTileId(tile.tileId)) {
      result.push(tile);
    }
    // unknown ids are dropped
  }
  return result;
}

/** True when `tiles` still contains a legacy id that `normalizeTiles` rewrites. */
export function needsNormalization(tiles: DashboardLayoutTile[]): boolean {
  return tiles.some(t => (t.tileId as string) === "dailies");
}

/** Reading order for the stacked mobile rendering: top-to-bottom, then
 * left-to-right within a row. */
export function sortTilesForMobile(
  tiles: DashboardLayoutTile[],
): DashboardLayoutTile[] {
  return tiles.slice().sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Removes the tile when present; otherwise appends it full-row at the bottom
 * of the grid so it's immediately visible and draggable into place. */
export function toggleTile(
  tiles: DashboardLayoutTile[],
  tileId: DashboardTileId,
): DashboardLayoutTile[] {
  if (tiles.some(t => t.tileId === tileId)) {
    return tiles.filter(t => t.tileId !== tileId);
  }
  const bottom = tiles.reduce((max, t) => Math.max(max, t.y + t.h), 0);
  return [
    ...tiles,
    {
      tileId,
      x: 0,
      y: bottom,
      w: 4,
      h: 7,
    },
  ];
}

export interface TileVisibilityItem {
  tileId: DashboardTileId;
  title: string;
  checked: boolean;
}

/** Every tile id paired with its title and whether `layout` currently shows it.
 * Backs the tile-visibility checklists (dashboard dialog + settings dropdown),
 * which share this logic but render different controls. */
export function tileVisibilityItems(
  layout: DashboardLayout,
): TileVisibilityItem[] {
  return DASHBOARD_TILE_IDS.map(tileId => ({
    tileId,
    title: TILE_META[tileId].title,
    checked: layout.tiles.some(t => t.tileId === tileId),
  }));
}

/**
 * Order-insensitive comparison of two tile sets. Compares id + position + width
 * for every tile, and height only for fixed-height tiles — an auto-height
 * tile's `h` is content-driven and must not trigger a save on its own.
 */
export function tilesEqual(
  a: DashboardLayoutTile[],
  b: DashboardLayoutTile[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((tile) => {
    const other = b.find(t => t.tileId === tile.tileId);
    if (
      !other
      || other.x !== tile.x
      || other.y !== tile.y
      || other.w !== tile.w
    ) {
      return false;
    }
    return isAutoHeight(tile) ? true : other.h === tile.h;
  });
}

// Per-item settings carried through the grid so a drag/resize round-trip never
// drops them. `resizable` and `resizeHandles` are consumed by @dnd-grid to
// control which resize handles a tile shows (width edge vs. SE corner).
interface GridItemSettings {
  heightMode?: DashboardLayoutTile["heightMode"];
  showProject?: boolean;
  showLabels?: boolean;
  showDescription?: boolean;
  showOverdue?: boolean;
  columns?: DailyTrackerColumnVisibility;
}

export interface GridLayoutItem extends GridItemSettings {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  resizable?: boolean;
  resizeHandles?: ResizeHandleAxis[];
}

function pickSettings(source: GridItemSettings): GridItemSettings {
  const out: GridItemSettings = {};
  if (source.heightMode !== undefined) out.heightMode = source.heightMode;
  if (source.showProject !== undefined) out.showProject = source.showProject;
  if (source.showLabels !== undefined) out.showLabels = source.showLabels;
  if (source.showDescription !== undefined) {
    out.showDescription = source.showDescription;
  }
  if (source.showOverdue !== undefined) out.showOverdue = source.showOverdue;
  if (source.columns !== undefined) out.columns = source.columns;
  return out;
}

/** Converts grid layout items back into persistable tiles, dropping any
 * unknown ids and the grid-only properties while preserving tile settings. */
export function layoutItemsToTiles(
  items: readonly GridLayoutItem[],
): DashboardLayoutTile[] {
  return items
    .filter(item => isDashboardTileId(item.id))
    .map(item => ({
      tileId: item.id as DashboardTileId,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      ...pickSettings(item),
    }));
}

export function tilesToLayoutItems(
  tiles: DashboardLayoutTile[],
): GridLayoutItem[] {
  return tiles.map(tile => ({
    id: tile.tileId,
    x: tile.x,
    y: tile.y,
    w: tile.w,
    h: tile.h,
    minW: TILE_META[tile.tileId].minW,
    minH: TILE_META[tile.tileId].minH,
    ...pickSettings(tile),
  }));
}
