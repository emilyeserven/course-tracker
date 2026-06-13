import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

import type { DashboardLayoutTile } from "./enums";

// Named dashboard layouts selectable from the dashboard's tab bar. `position`
// orders the tabs; `tiles` holds the enabled tiles with their grid placement
// (disabled tiles are absent from the array).
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  position: integer(),
  tiles: jsonb().$type<DashboardLayoutTile[]>().default([]).notNull(),
});
