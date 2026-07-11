import type { DashboardLayout, DashboardLayoutTile } from "@emstack/types";

import { DASHBOARD_TILE_IDS } from "@emstack/types";
import { describe, expect, test } from "vitest";

import {
  expectTilesRespectMinSize,
  tilesOverlap,
} from "@/test-utils/dashboardTileAssertions";
import {
  buildDefaultTiles,
  layoutItemsToTiles,
  needsNormalization,
  normalizeTiles,
  resizeHandlesForTile,
  sortTilesForMobile,
  tilesEqual,
  tilesToLayoutItems,
  tileVisibilityItems,
  TILE_META,
  toggleTile,
} from "./dashboardTiles";

describe("buildDefaultTiles", () => {
  test("contains every tile exactly once", () => {
    const tiles = buildDefaultTiles();
    expect(tiles.map(t => t.tileId).sort()).toEqual(
      [...DASHBOARD_TILE_IDS].sort(),
    );
  });

  test("puts Do Now full-width at the top", () => {
    const doNow = buildDefaultTiles().find(t => t.tileId === "doNow");
    expect(doNow).toMatchObject({
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
        expect(tilesOverlap(tile, other)).toBe(false);
      }
    }
  });

  test("respects each tile's minimum size", () => {
    expectTilesRespectMinSize(buildDefaultTiles());
  });
});

describe("sortTilesForMobile", () => {
  test("orders tiles top to bottom by row", () => {
    const tiles = buildDefaultTiles();
    const expectedOrder = tiles.map(t => t.tileId);
    const shuffled = tiles.slice().reverse();
    expect(sortTilesForMobile(shuffled).map(t => t.tileId)).toEqual(
      expectedOrder,
    );
  });

  test("breaks ties on the same row by column", () => {
    const right: DashboardLayoutTile = {
      tileId: "coursesInProgress",
      x: 2,
      y: 0,
      w: 2,
      h: 4,
    };
    const left: DashboardLayoutTile = {
      tileId: "doNow",
      x: 0,
      y: 0,
      w: 2,
      h: 4,
    };
    expect(sortTilesForMobile([right, left]).map(t => t.tileId)).toEqual([
      "doNow",
      "coursesInProgress",
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
    const next = toggleTile(buildDefaultTiles(), "coursesInProgress");
    expect(next).toHaveLength(buildDefaultTiles().length - 1);
    expect(next.some(t => t.tileId === "coursesInProgress")).toBe(false);
  });

  test("appends a missing tile below the existing ones", () => {
    const without = buildDefaultTiles().filter(
      t => t.tileId !== "coursesInProgress",
    );
    const next = toggleTile(without, "coursesInProgress");
    const added = next.find(t => t.tileId === "coursesInProgress");
    const bottom = Math.max(...without.map(t => t.y + t.h));
    expect(added).toMatchObject({
      x: 0,
      y: bottom,
    });
  });

  test("adds at y=0 when the layout is empty", () => {
    expect(toggleTile([], "doNow")[0]).toMatchObject({
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
      t.tileId === "coursesInProgress"
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

  test("ignores height changes on auto-height tiles", () => {
    const auto: DashboardLayoutTile = {
      tileId: "doNow",
      x: 0,
      y: 0,
      w: 4,
      h: 5,
      heightMode: "auto",
    };
    const grown = {
      ...auto,
      h: 9,
    };
    expect(tilesEqual([auto], [grown])).toBe(true);
  });

  test("detects height changes on fixed-height tiles", () => {
    const fixed: DashboardLayoutTile = {
      tileId: "doNow",
      x: 0,
      y: 0,
      w: 4,
      h: 5,
      heightMode: "fixed",
    };
    const resized = {
      ...fixed,
      h: 9,
    };
    expect(tilesEqual([fixed], [resized])).toBe(false);
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
        id: "doNow",
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
        tileId: "doNow",
        x: 1,
        y: 2,
        w: 3,
        h: 4,
      },
    ]);
  });

  test("preserves per-tile settings through a round-trip", () => {
    const tiles: DashboardLayoutTile[] = [
      {
        tileId: "todoist",
        x: 0,
        y: 0,
        w: 4,
        h: 5,
        heightMode: "fixed",
        showProject: false,
        showOverdue: true,
      },
    ];
    expect(layoutItemsToTiles(tilesToLayoutItems(tiles))).toEqual(tiles);
  });
});

describe("normalizeTiles", () => {
  test("splits a legacy dailies tile into Do Now + Done for the Day", () => {
    const result = normalizeTiles([
      {
        tileId: "dailies" as DashboardLayoutTile["tileId"],
        x: 0,
        y: 0,
        w: 4,
        h: 8,
      },
    ]);
    expect(result.map(t => t.tileId)).toEqual(["doNow", "doneForDay"]);
    const [doNow, doneForDay] = result;
    expect(doNow).toMatchObject({
      x: 0,
      y: 0,
      w: 4,
    });
    // Done for the Day sits directly below Do Now.
    expect(doneForDay.y).toBe(doNow.y + doNow.h);
  });

  test("passes known tiles through and drops unknown ids", () => {
    const known: DashboardLayoutTile = {
      tileId: "readwise",
      x: 0,
      y: 0,
      w: 2,
      h: 4,
    };
    const result = normalizeTiles([
      known,
      {
        tileId: "gone" as DashboardLayoutTile["tileId"],
        x: 0,
        y: 4,
        w: 1,
        h: 1,
      },
    ]);
    expect(result).toEqual([known]);
  });
});

describe("needsNormalization", () => {
  test("is true only when a legacy id is present", () => {
    expect(needsNormalization(buildDefaultTiles())).toBe(false);
    expect(
      needsNormalization([
        {
          tileId: "dailies" as DashboardLayoutTile["tileId"],
          x: 0,
          y: 0,
          w: 4,
          h: 8,
        },
      ]),
    ).toBe(true);
  });
});

describe("resizeHandlesForTile", () => {
  test("auto-height tiles get only the width (east) handle", () => {
    expect(resizeHandlesForTile({})).toEqual(["e"]);
    expect(
      resizeHandlesForTile({
        heightMode: "auto",
      }),
    ).toEqual(["e"]);
  });

  test("fixed-height tiles also get the SE corner for height", () => {
    expect(
      resizeHandlesForTile({
        heightMode: "fixed",
      }),
    ).toEqual(["e", "se"]);
  });
});

describe("tileVisibilityItems", () => {
  const layout = {
    id: "l1",
    name: "Layout",
    position: 0,
    isTemplate: false,
    tiles: [
      {
        tileId: "doNow",
        x: 0,
        y: 0,
        w: 4,
        h: 6,
      },
    ],
  } as DashboardLayout;

  test("returns one item per known tile id", () => {
    expect(tileVisibilityItems(layout)).toHaveLength(DASHBOARD_TILE_IDS.length);
  });

  test("marks present tiles checked and uses TILE_META titles", () => {
    const items = tileVisibilityItems(layout);
    const doNow = items.find(i => i.tileId === "doNow");
    const changelog = items.find(i => i.tileId === "changelog");
    expect(doNow).toEqual({
      tileId: "doNow",
      title: TILE_META.doNow.title,
      checked: true,
    });
    expect(changelog?.checked).toBe(false);
  });
});
