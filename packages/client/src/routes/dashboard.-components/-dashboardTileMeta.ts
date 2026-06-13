import type { DashboardLayoutTile, DashboardTileId } from "@emstack/types";

import { DASHBOARD_TILE_IDS } from "@emstack/types";

// Pure layout helpers for the dashboard grid — no component imports, so the
// module stays unit-testable. The component map lives in -DashboardGrid.tsx.

export interface DashboardTileMeta {
  title: string;
  minW: number;
  minH: number;
}

export const TILE_META: Record<DashboardTileId, DashboardTileMeta> = {
  dailies: {
    title: "Dailies",
    minW: 2,
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
  radars: {
    title: "Radars",
    minW: 1,
    minH: 4,
  },
  readwise: {
    title: "Readwise",
    minW: 2,
    minH: 4,
  },
  todoist: {
    title: "Todoist",
    minW: 1,
    minH: 4,
  },
};

function isDashboardTileId(id: string): id is DashboardTileId {
  return (DASHBOARD_TILE_IDS as readonly string[]).includes(id);
}

// Every tile starts full-width (spanning all 4 columns) and stacked top to
// bottom. Users narrow a tile by dragging the resize handle in its bottom-right
// corner, which lets the grid pack the freed space with the next tile.
const DEFAULT_TILE_HEIGHTS: { tileId: DashboardTileId;
  h: number; }[] = [
  {
    tileId: "dailies",
    h: 8,
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
    tileId: "radars",
    h: 7,
  },
  {
    tileId: "readwise",
    h: 7,
  },
];

/** Full-width tiles stacked top to bottom, dailies first. */
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

/** Order-insensitive comparison of two tile sets (id + position + size). */
export function tilesEqual(
  a: DashboardLayoutTile[],
  b: DashboardLayoutTile[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((tile) => {
    const other = b.find(t => t.tileId === tile.tileId);
    return (
      !!other
      && other.x === tile.x
      && other.y === tile.y
      && other.w === tile.w
      && other.h === tile.h
    );
  });
}

export interface GridLayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

/** Converts grid layout items back into persistable tiles, dropping any
 * unknown ids and the grid-only properties. */
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
  }));
}
