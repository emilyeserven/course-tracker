import type { GridLayoutItem } from "@/lib/dashboardTiles";
import type { DashboardLayoutTile } from "@emstack/types";

import {
  isAutoHeight,
  resizeHandlesForTile,
  tilesToLayoutItems,
} from "@/lib/dashboardTiles";

/** Root font size in px, used to convert the 4em-per-row grid unit to pixels. */
export function rootFontSizePx(): number {
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
export function buildDisplayLayout(
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
export function applyGeometryToTiles(
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
