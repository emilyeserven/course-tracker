import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { DashboardTileId } from "@emstack/types";

import { DashboardChangelog } from "./-DashboardChangelog";
import { DashboardCoursesByAmortization } from "./-DashboardCoursesByAmortization";
import { DashboardCoursesInProgress } from "./-DashboardCoursesInProgress";
import { DashboardDoneForDay, DashboardDoNow } from "./-DashboardDailies";
import { DashboardExplore } from "./-DashboardExplore";
import { DashboardGoogleCalendar } from "./-DashboardGoogleCalendar";
import { DashboardRadars } from "./-DashboardRadars";
import { DashboardReadwise } from "./-DashboardReadwise";
import { DashboardTodoist } from "./-DashboardTodoist";
import { DashboardUnderutilizedProviders } from "./-DashboardUnderutilizedProviders";

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
