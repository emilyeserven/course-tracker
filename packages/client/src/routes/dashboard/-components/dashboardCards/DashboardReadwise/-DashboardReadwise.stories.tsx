import { DashboardReadwise } from "./-DashboardReadwise";

import { integrationTileStories } from "@/test-utils/integrationTileStories";
import { queryKeys } from "@/utils/queryKeys";

const stories = integrationTileStories({
  component: DashboardReadwise,
  tileId: "readwise",
  queryKey: queryKeys.readwise.readingList(),
  emptyData: {
    started: [],
    unstarted: [],
  },
});

// Spread so the default export stays a literal object the CSF indexer can read.
export default {
  ...stories.meta,
};
export const ConnectPrompt = stories.ConnectPrompt;
export const ConfiguredEmpty = stories.ConfiguredEmpty;
