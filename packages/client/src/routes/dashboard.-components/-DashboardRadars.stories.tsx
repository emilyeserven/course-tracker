import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardRadars } from "./-DashboardRadars";

import { makeDomain } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

function clientWith(domains: unknown) {
  return seededQueryClient([[["domains"], domains]]);
}

const meta: Meta<typeof DashboardRadars> = {
  component: DashboardRadars,
  args: {
    tile: makeTile("radars"),
    onUpdateTile: fn(),
  },
  decorators: [queryStoryDecorator(clientWith([makeDomain()]))],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Lists the domains as radar links.
export const Default: Story = {
  play: smokeText("Frontend Engineering"),
};

// No domains yet shows the empty message.
export const Empty: Story = {
  decorators: [queryStoryDecorator(clientWith([]))],
  play: smokeText(/no radars yet/i),
};
