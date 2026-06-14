import type { GridLayoutItem } from "@/lib/dashboardTiles";

import { describe, expect, test } from "vitest";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { applyGeometryToTiles, buildDisplayLayout } from "./-gridLayout";

describe("buildDisplayLayout", () => {
  test("marks every tile resizable and attaches resize handles", () => {
    const tiles = [makeTile("todoist"), makeTile("changelog")];
    const layout = buildDisplayLayout(tiles, new Map());

    expect(layout).toHaveLength(2);
    for (const item of layout) {
      expect(item.resizable).toBe(true);
      expect(item.resizeHandles).toBeDefined();
    }
  });

  test("an auto-height tile takes its measured row count", () => {
    const tiles = [
      makeTile("todoist", {
        heightMode: "auto",
        h: 4,
      }),
    ];
    const layout = buildDisplayLayout(tiles, new Map([["todoist", 9]]));

    expect(layout[0].h).toBe(9);
  });

  test("a fixed-height tile keeps its own height", () => {
    const tiles = [
      makeTile("todoist", {
        heightMode: "fixed",
        h: 4,
      }),
    ];
    const layout = buildDisplayLayout(tiles, new Map([["todoist", 9]]));

    expect(layout[0].h).toBe(4);
  });
});

describe("applyGeometryToTiles", () => {
  const geometry = (id: string, h: number): GridLayoutItem =>
    ({
      id,
      x: 1,
      y: 2,
      w: 3,
      h,
    }) as GridLayoutItem;

  test("writes x/y/w and, for fixed tiles, the grid height back", () => {
    const persisted = [
      makeTile("todoist", {
        heightMode: "fixed",
        h: 4,
      }),
    ];
    const [result] = applyGeometryToTiles([geometry("todoist", 8)], persisted);

    expect(result).toMatchObject({
      x: 1,
      y: 2,
      w: 3,
      h: 8,
    });
  });

  test("never writes a content-driven height back to an auto tile", () => {
    const persisted = [
      makeTile("todoist", {
        heightMode: "auto",
        h: 4,
      }),
    ];
    const [result] = applyGeometryToTiles([geometry("todoist", 8)], persisted);

    expect(result.h).toBe(4);
    expect(result).toMatchObject({
      x: 1,
      y: 2,
      w: 3,
    });
  });

  test("drops geometry whose id no longer matches a persisted tile", () => {
    const persisted = [makeTile("todoist")];
    const result = applyGeometryToTiles([geometry("ghost", 8)], persisted);

    expect(result).toEqual([]);
  });
});
