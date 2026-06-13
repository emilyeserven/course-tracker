import type { DashboardLayoutTile } from "@emstack/types";

import { DASHBOARD_TILE_IDS } from "@emstack/types";
import { describe, expect, test } from "vitest";

import {
  buildDefaultTiles,
  layoutItemsToTiles,
  sortTilesForMobile,
  tilesEqual,
  tilesToLayoutItems,
  TILE_META,
  toggleTile,
} from "./-dashboardTileMeta";

function overlaps(a: DashboardLayoutTile, b: DashboardLayoutTile): boolean {
  return (
    a.x < b.x + b.w
    && b.x < a.x + a.w
    && a.y < b.y + b.h
    && b.y < a.y + a.h
  );
}

describe("buildDefaultTiles", () => {
  test("contains every tile exactly once", () => {
    const tiles = buildDefaultTiles();
    expect(tiles.map(t => t.tileId).sort())
      .toEqual([...DASHBOARD_TILE_IDS].sort());
  });

  test("puts dailies full-width at the top", () => {
    const dailies = buildDefaultTiles().find(t => t.tileId === "dailies");
    expect(dailies).toMatchObject({
      x: 0,
      y: 0,
      w: 4,
    });
  });

  test("has no overlapping tiles and stays within 4 columns", () => {
    const tiles = buildDefaultTiles();
    for (const tile of tiles) {
      expect(tile.x + tile.w).toBeLessThanOrEqual(4);
      for (const other of tiles) {
        if (other.tileId === tile.tileId) continue;
        expect(overlaps(tile, other)).toBe(false);
      }
    }
  });

  test("respects each tile's minimum size", () => {
    for (const tile of buildDefaultTiles()) {
      expect(tile.w).toBeGreaterThanOrEqual(TILE_META[tile.tileId].minW);
      expect(tile.h).toBeGreaterThanOrEqual(TILE_META[tile.tileId].minH);
    }
  });
});

describe("sortTilesForMobile", () => {
  test("orders by row first, then column", () => {
    const tiles = buildDefaultTiles();
    const shuffled = [tiles[3], tiles[0], tiles[5], tiles[4], tiles[2], tiles[1]];
    expect(sortTilesForMobile(shuffled).map(t => t.tileId)).toEqual([
      "dailies",
      "underutilizedProviders",
      "coursesByAmortization",
      "coursesInProgress",
      "radars",
      "readwise",
    ]);
  });

  test("does not mutate the input array", () => {
    const tiles = buildDefaultTiles().reverse();
    const before = tiles.map(t => t.tileId);
    sortTilesForMobile(tiles);
    expect(tiles.map(t => t.tileId)).toEqual(before);
  });
});

describe("toggleTile", () => {
  test("removes a tile that is present", () => {
    const next = toggleTile(buildDefaultTiles(), "radars");
    expect(next).toHaveLength(buildDefaultTiles().length - 1);
    expect(next.some(t => t.tileId === "radars")).toBe(false);
  });

  test("appends a missing tile below the existing ones", () => {
    const without = buildDefaultTiles().filter(t => t.tileId !== "radars");
    const next = toggleTile(without, "radars");
    const added = next.find(t => t.tileId === "radars");
    const bottom = Math.max(...without.map(t => t.y + t.h));
    expect(added).toMatchObject({
      x: 0,
      y: bottom,
    });
  });

  test("adds at y=0 when the layout is empty", () => {
    expect(toggleTile([], "dailies")[0]).toMatchObject({
      x: 0,
      y: 0,
    });
  });
});

describe("tilesEqual", () => {
  test("is order-insensitive", () => {
    const tiles = buildDefaultTiles();
    expect(tilesEqual(tiles, tiles.slice().reverse())).toBe(true);
  });

  test("detects a moved tile", () => {
    const tiles = buildDefaultTiles();
    const moved = tiles.map(t =>
      t.tileId === "radars"
        ? {
          ...t,
          x: 0,
          y: 30,
        }
        : t);
    expect(tilesEqual(tiles, moved)).toBe(false);
  });

  test("detects a removed tile", () => {
    const tiles = buildDefaultTiles();
    expect(tilesEqual(tiles, tiles.slice(1))).toBe(false);
  });
});

describe("layout item conversion", () => {
  test("round-trips tiles through layout items", () => {
    const tiles = buildDefaultTiles();
    expect(layoutItemsToTiles(tilesToLayoutItems(tiles))).toEqual(tiles);
  });

  test("layout items carry minW/minH from TILE_META", () => {
    for (const item of tilesToLayoutItems(buildDefaultTiles())) {
      const meta = TILE_META[item.id as keyof typeof TILE_META];
      expect(item.minW).toBe(meta.minW);
      expect(item.minH).toBe(meta.minH);
    }
  });

  test("drops unknown ids and strips grid-only props", () => {
    const tiles = layoutItemsToTiles([
      {
        id: "dailies",
        x: 1,
        y: 2,
        w: 3,
        h: 4,
        minW: 2,
        minH: 4,
      },
      {
        id: "not-a-tile",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      },
    ]);
    expect(tiles).toEqual([
      {
        tileId: "dailies",
        x: 1,
        y: 2,
        w: 3,
        h: 4,
      },
    ]);
  });
});
