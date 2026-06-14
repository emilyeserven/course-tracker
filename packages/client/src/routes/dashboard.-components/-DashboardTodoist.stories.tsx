import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardTodoist } from "./-DashboardTodoist";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";
import { queryKeys } from "@/utils/queryKeys";

function clientWith(configured: boolean) {
  return seededQueryClient([
    [
      queryKeys.todoist.tasks(),
      {
        configured,
        overdue: [],
        today: [],
      },
    ],
  ]);
}

const meta: Meta<typeof DashboardTodoist> = {
  component: DashboardTodoist,
  args: {
    tile: makeTile("todoist"),
    onUpdateTile: fn(),
  },
  decorators: [queryStoryDecorator(clientWith(false))],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Not connected: the card prompts the user to add an API key.
export const ConnectPrompt: Story = {
  play: smokeText(/add your todoist api key/i),
};

// Connected with nothing due shows the celebratory empty state.
export const ConfiguredEmpty: Story = {
  decorators: [queryStoryDecorator(clientWith(true))],
  play: smokeText(/nothing due today/i),
};
