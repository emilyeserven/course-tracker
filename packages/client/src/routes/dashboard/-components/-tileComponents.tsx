import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { DashboardTileId } from "@emstack/types";

import {
  DashboardChangelog,
  DashboardDoNow,
  DashboardDoneForDay,
  DashboardGoogleCalendar,
  DashboardReadwise,
  DashboardTodoist,
} from "./dashboardCards";

export const TILE_COMPONENTS: Record<
  DashboardTileId,
  React.ComponentType<DashboardTileProps>
> = {
  doNow: DashboardDoNow,
  doneForDay: DashboardDoneForDay,
  readwise: DashboardReadwise,
  todoist: DashboardTodoist,
  googleCalendar: DashboardGoogleCalendar,
  changelog: DashboardChangelog,
};
