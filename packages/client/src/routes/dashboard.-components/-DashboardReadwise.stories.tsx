import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardReadwise } from "./-DashboardReadwise";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";
import { queryKeys } from "@/utils/queryKeys";

function clientWith(configured: boolean) {
  return seededQueryClient([
    [
      queryKeys.readwise.readingList(),
      {
        configured,
        started: [],
        unstarted: [],
      },
    ],
  ]);
}

const meta: Meta<typeof DashboardReadwise> = {
  component: DashboardReadwise,
  args: {
    tile: makeTile("readwise"),
    onUpdateTile: fn(),
  },
  decorators: [queryStoryDecorator(clientWith(false))],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Not connected: the card prompts the user to add an API key.
export const ConnectPrompt: Story = {
  play: smokeText(/add your readwise api key/i),
};

// Connected but with no articles yet shows the empty in-progress state.
export const ConfiguredEmpty: Story = {
  decorators: [queryStoryDecorator(clientWith(true))],
  play: smokeText(/no articles in progress/i),
};
