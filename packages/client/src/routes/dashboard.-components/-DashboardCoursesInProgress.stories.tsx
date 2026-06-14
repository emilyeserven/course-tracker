import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardCoursesInProgress } from "./-DashboardCoursesInProgress";

import { makeResources } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

function clientWith(resources: unknown) {
  return seededQueryClient([
    [["resources"], resources],
    [["dailies"], []],
  ]);
}

const meta: Meta<typeof DashboardCoursesInProgress> = {
  component: DashboardCoursesInProgress,
  args: {
    tile: makeTile("coursesInProgress"),
    onUpdateTile: fn(),
  },
  decorators: [queryStoryDecorator(clientWith(makeResources()))],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Active courses without an active daily are listed as links.
export const Default: Story = {
  play: smokeText("Resources in Progress", "Course 1"),
};

// No active courses shows the empty message.
export const Empty: Story = {
  decorators: [queryStoryDecorator(clientWith([]))],
  play: smokeText(/no courses in progress/i),
};
