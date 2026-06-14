import { describe, expect, test } from "vitest";

import {
  expectTilesRespectMinSize,
  tilesOverlap,
} from "@/test-utils/dashboardTileAssertions";
import { LAYOUT_PRESETS } from "./-layoutPresets";

describe("LAYOUT_PRESETS", () => {
  test("includes a blank preset that yields no tiles", () => {
    const blank = LAYOUT_PRESETS.find(p => p.key === "blank");
    expect(blank).toBeDefined();
    expect(blank?.buildTiles()).toEqual([]);
  });

  test("preset keys are unique", () => {
    const keys = LAYOUT_PRESETS.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  for (const preset of LAYOUT_PRESETS) {
    describe(preset.key, () => {
      test("stays within the 4-column grid with valid sizes", () => {
        for (const tile of preset.buildTiles()) {
          expect(tile.x).toBeGreaterThanOrEqual(0);
          expect(tile.y).toBeGreaterThanOrEqual(0);
          expect(tile.x + tile.w).toBeLessThanOrEqual(4);
          expect(tile.w).toBeGreaterThanOrEqual(1);
          expect(tile.w).toBeLessThanOrEqual(4);
          expect(tile.h).toBeGreaterThanOrEqual(1);
        }
      });

      test("has no overlapping tiles and no duplicate tile ids", () => {
        const tiles = preset.buildTiles();
        const ids = tiles.map(t => t.tileId);
        expect(new Set(ids).size).toBe(ids.length);
        for (const tile of tiles) {
          for (const other of tiles) {
            if (other === tile) continue;
            expect(tilesOverlap(tile, other)).toBe(false);
          }
        }
      });

      test("respects each tile's minimum size", () => {
        expectTilesRespectMinSize(preset.buildTiles());
      });
    });
  }
});
