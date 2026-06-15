// Dashboard tiles are a fixed set defined by the client's dashboard cards.
// The ids live here (as a runtime const) so the client tile registry and the
// middleware JSON-schema enum both derive from the same list.
export const DASHBOARD_TILE_IDS = [
  "doNow",
  "doneForDay",
  "underutilizedProviders",
  "coursesByAmortization",
  "coursesInProgress",
  "radars",
  "exploreSomething",
  "readwise",
  "todoist",
  "googleCalendar",
  "changelog",
] as const;

export type DashboardTileId = (typeof DASHBOARD_TILE_IDS)[number];

// How a tile sizes itself vertically. "auto" grows the card to fit its content
// (no inner scroll); "fixed" uses the height set by the grid resize handle.
// An undefined `heightMode` is treated as "auto" (the default).
export type TileHeightMode = "auto" | "fixed";

// The daily-tracker table columns the user can show/hide from the Do Now /
// Done for the Day card settings. Lives here (a runtime const) so the client
// table builder and the middleware JSON schema derive from the same list — the
// always-on Title and Today's Status columns are deliberately not toggleable.
// "days" toggles the recent-day columns as a group.
export const DAILY_TRACKER_TOGGLEABLE_COLUMNS = [
  "progress",
  "routine",
  "type",
  "cadence",
  "streak",
  "total",
  "comment",
  "days",
  "location",
] as const;

export type DailyTrackerColumnKey
  = (typeof DAILY_TRACKER_TOGGLEABLE_COLUMNS)[number];

// Per-tile show/hide state for the toggleable columns. Partial: a missing key
// means "use the default" (all on except the routine column).
export type DailyTrackerColumnVisibility = Partial<
  Record<DailyTrackerColumnKey, boolean>
>;

// Position/size of one enabled tile in the 4-column dashboard grid. A tile
// that is disabled is simply absent from the layout's `tiles` array. The grid
// `h` unit is 4em per row (see the client grid config).
export interface DashboardLayoutTile {
  tileId: DashboardTileId;
  x: number;
  y: number;
  w: number;
  h: number;
  // Per-card display settings, edited via the card's gear flyout and persisted
  // per tile (so they're per dashboard tab). All optional; readers apply
  // defaults so existing rows stay valid.
  heightMode?: TileHeightMode;
  // Todoist tile only — show/hide pieces of each task row / section.
  showProject?: boolean;
  showLabels?: boolean;
  showDescription?: boolean;
  showOverdue?: boolean;
  // Do Now / Done for the Day tiles only — which tracker-table columns to show.
  columns?: DailyTrackerColumnVisibility;
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
