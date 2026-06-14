import type { DashboardLayoutTile } from "@emstack/types";

import { expect } from "vitest";

import { TILE_META } from "@/lib/dashboardTiles";

/** Axis-aligned overlap test for two grid tiles. */
export function tilesOverlap(
  a: DashboardLayoutTile,
  b: DashboardLayoutTile,
): boolean {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/** Assert every tile meets its TILE_META minimum width/height. */
export function expectTilesRespectMinSize(tiles: DashboardLayoutTile[]): void {
  for (const tile of tiles) {
    expect(tile.w).toBeGreaterThanOrEqual(TILE_META[tile.tileId].minW);
    expect(tile.h).toBeGreaterThanOrEqual(TILE_META[tile.tileId].minH);
  }
}
