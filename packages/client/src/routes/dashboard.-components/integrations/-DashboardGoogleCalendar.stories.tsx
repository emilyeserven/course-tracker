import { DashboardGoogleCalendar } from "./-DashboardGoogleCalendar";

import { integrationTileStories } from "@/test-utils/integrationTileStories";
import { queryKeys } from "@/utils/queryKeys";

const stories = integrationTileStories({
  component: DashboardGoogleCalendar,
  tileId: "googleCalendar",
  queryKey: queryKeys.googleCalendar.events(),
  emptyData: {
    events: [],
  },
});

// Spread so the default export stays a literal object the CSF indexer can read.
export default {
  ...stories.meta,
};
export const ConnectPrompt = stories.ConnectPrompt;
export const ConfiguredEmpty = stories.ConfiguredEmpty;
