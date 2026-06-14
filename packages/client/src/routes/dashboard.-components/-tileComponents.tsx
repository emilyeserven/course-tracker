import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { DashboardTileId } from "@emstack/types";

import {
  DashboardCoursesByAmortization,
  DashboardCoursesInProgress,
  DashboardUnderutilizedProviders,
} from "./courses";
import { DashboardDoneForDay, DashboardDoNow } from "./dailies";
import {
  DashboardChangelog,
  DashboardExplore,
  DashboardRadars,
} from "./insights";
import {
  DashboardGoogleCalendar,
  DashboardReadwise,
  DashboardTodoist,
} from "./integrations";

export const TILE_COMPONENTS: Record<
  DashboardTileId,
  React.ComponentType<DashboardTileProps>
> = {
  doNow: DashboardDoNow,
  doneForDay: DashboardDoneForDay,
  underutilizedProviders: DashboardUnderutilizedProviders,
  coursesByAmortization: DashboardCoursesByAmortization,
  coursesInProgress: DashboardCoursesInProgress,
  radars: DashboardRadars,
  exploreSomething: DashboardExplore,
  readwise: DashboardReadwise,
  todoist: DashboardTodoist,
  googleCalendar: DashboardGoogleCalendar,
  changelog: DashboardChangelog,
};
