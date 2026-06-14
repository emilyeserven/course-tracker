import { DashboardTodoist } from "./-DashboardTodoist";

import { integrationTileStories } from "@/test-utils/integrationTileStories";
import { queryKeys } from "@/utils/queryKeys";

const stories = integrationTileStories({
  component: DashboardTodoist,
  tileId: "todoist",
  queryKey: queryKeys.todoist.tasks(),
  emptyData: {
    overdue: [],
    today: [],
  },
  connectText: /add your todoist api key/i,
  emptyText: /nothing due today/i,
});

// Spread so the default export stays a literal object the CSF indexer can read.
export default {
  ...stories.meta,
};
export const ConnectPrompt = stories.ConnectPrompt;
export const ConfiguredEmpty = stories.ConfiguredEmpty;
