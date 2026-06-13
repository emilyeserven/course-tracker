// Dashboard tiles are a fixed set defined by the client's dashboard cards.
// The ids live here (as a runtime const) so the client tile registry and the
// middleware JSON-schema enum both derive from the same list.
export const DASHBOARD_TILE_IDS = [
  "dailies",
  "underutilizedProviders",
  "coursesByAmortization",
  "coursesInProgress",
  "radars",
  "exploreSomething",
  "readwise",
  "todoist",
  "changelog",
] as const;

export type DashboardTileId = (typeof DASHBOARD_TILE_IDS)[number];

// Position/size of one enabled tile in the 4-column dashboard grid. A tile
// that is disabled is simply absent from the layout's `tiles` array.
export interface DashboardLayoutTile {
  tileId: DashboardTileId;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  position?: number | null;
  tiles: DashboardLayoutTile[];
  // Presets ("saved layouts") are excluded from the dashboard's tab strip and
  // offered as starting points when adding a tab. A missing value means "a
  // normal tab", so existing layouts read as tabs without a backfill.
  isTemplate?: boolean;
}
