import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardGoogleCalendar } from "./-DashboardGoogleCalendar";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";
import { queryKeys } from "@/utils/queryKeys";

function clientWith(configured: boolean) {
  return seededQueryClient([
    [
      queryKeys.googleCalendar.events(),
      {
        configured,
        events: [],
      },
    ],
  ]);
}

const meta: Meta<typeof DashboardGoogleCalendar> = {
  component: DashboardGoogleCalendar,
  args: {
    tile: makeTile("googleCalendar"),
    onUpdateTile: fn(),
  },
  decorators: [queryStoryDecorator(clientWith(false))],
};

export default meta;

type Story = StoryObj<typeof meta>;

// No feed subscribed: the card prompts the user to add one.
export const ConnectPrompt: Story = {
  play: smokeText(/add a calendar feed/i),
};

// Connected with no upcoming events shows the empty state.
export const ConfiguredEmpty: Story = {
  decorators: [queryStoryDecorator(clientWith(true))],
  play: smokeText(/no upcoming events/i),
};
