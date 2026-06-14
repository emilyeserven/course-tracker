import type { DashboardLayoutTile, DashboardTileId } from "@emstack/types";

/**
 * Mock-data factory for the dashboard tiles. Each tile component receives a
 * `DashboardLayoutTile` (its grid position/size + per-card settings); this fills
 * in sensible defaults so a story only specifies the id and any setting it cares
 * about. Mirrors the other `test-utils/*Fixtures.ts` factories.
 */
export function makeTile(
  tileId: DashboardTileId,
  overrides: Partial<DashboardLayoutTile> = {},
): DashboardLayoutTile {
  return {
    tileId,
    x: 0,
    y: 0,
    w: 4,
    h: 7,
    ...overrides,
  };
}
