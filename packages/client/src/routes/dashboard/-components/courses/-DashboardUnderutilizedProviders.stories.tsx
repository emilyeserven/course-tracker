import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardUnderutilizedProviders } from "./-DashboardUnderutilizedProviders";

import { makeProvider } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

function clientWith(providers: unknown) {
  return seededQueryClient([[["providers"], providers]]);
}

const meta: Meta<typeof DashboardUnderutilizedProviders> = {
  component: DashboardUnderutilizedProviders,
  args: {
    tile: makeTile("underutilizedProviders"),
    onUpdateTile: fn(),
  },
  decorators: [
    queryStoryDecorator(
      clientWith([
        makeProvider({
          completeCount: 2,
        }),
      ]),
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// A paid provider with no active courses shows in the underutilized table.
export const Default: Story = {
  play: smokeText("Acme Learning"),
};

// No qualifying providers shows the empty message.
export const Empty: Story = {
  decorators: [queryStoryDecorator(clientWith([]))],
  play: smokeText(/no underutilized providers/i),
};
