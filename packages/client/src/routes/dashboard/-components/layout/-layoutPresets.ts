import type { DashboardLayoutTile, DashboardTileId } from "@emstack/types";

import { buildDefaultTiles, TILE_META } from "@/lib/dashboardTiles";

// Curated, code-defined starting layouts offered when adding a tab. Built-ins
// are never persisted as rows — picking one just creates a new layout from the
// tiles `buildTiles()` returns. Kept as a pure module (no component imports)
// so it stays unit-testable like -dashboardTileMeta.ts.

export interface LayoutPreset {
  /** Stable id used as the picker's select value. */
  key: string;
  /** Suggested tab name when this preset is chosen. */
  name: string;
  description: string;
  buildTiles: () => DashboardLayoutTile[];
}

/** Full-width tiles stacked top to bottom, in the given order. Heights respect
 * each tile's minimum from TILE_META, so the result satisfies the same grid
 * invariants the backend's dashboardLayoutTilesSchema enforces. */
function stackTiles(ids: DashboardTileId[]): DashboardLayoutTile[] {
  let y = 0;
  return ids.map((tileId) => {
    const h = Math.max(TILE_META[tileId].minH, 7);
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

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    key: "blank",
    name: "New layout",
    description: "Start empty and add tiles yourself.",
    buildTiles: () => [],
  },
  {
    key: "default",
    name: "Default",
    description: "Every tile, full-width and stacked.",
    buildTiles: buildDefaultTiles,
  },
  {
    key: "courses",
    name: "Courses focus",
    description: "Dailies plus course progress and spend.",
    buildTiles: () =>
      stackTiles([
        "doNow",
        "doneForDay",
        "coursesInProgress",
        "coursesByAmortization",
        "underutilizedProviders",
      ]),
  },
  {
    key: "tasks",
    name: "Tasks & habits",
    description: "Dailies and Todoist tasks.",
    buildTiles: () => stackTiles(["doNow", "doneForDay", "todoist"]),
  },
];
