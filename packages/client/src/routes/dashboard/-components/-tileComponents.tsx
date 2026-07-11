import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { DashboardTileId } from "@emstack/types";

import {
  DashboardChangelog,
  DashboardCoursesByAmortization,
  DashboardCoursesInProgress,
  DashboardDoNow,
  DashboardDoneForDay,
  DashboardGoogleCalendar,
  DashboardReadwise,
  DashboardTodoist,
  DashboardUnderutilizedProviders,
} from "./dashboardCards";

export const TILE_COMPONENTS: Record<
  DashboardTileId,
  React.ComponentType<DashboardTileProps>
> = {
  doNow: DashboardDoNow,
  doneForDay: DashboardDoneForDay,
  underutilizedProviders: DashboardUnderutilizedProviders,
  coursesByAmortization: DashboardCoursesByAmortization,
  coursesInProgress: DashboardCoursesInProgress,
  readwise: DashboardReadwise,
  todoist: DashboardTodoist,
  googleCalendar: DashboardGoogleCalendar,
  changelog: DashboardChangelog,
};
