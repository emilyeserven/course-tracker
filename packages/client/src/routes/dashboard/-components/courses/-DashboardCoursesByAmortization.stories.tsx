import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DashboardCoursesByAmortization } from "./-DashboardCoursesByAmortization";

import { makeProvider, makeResources } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof DashboardCoursesByAmortization> = {
  component: DashboardCoursesByAmortization,
  args: {
    tile: makeTile("coursesByAmortization"),
    onUpdateTile: fn(),
  },
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [["resources"], makeResources()],
        [["providers"], [makeProvider()]],
      ]),
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Courses tab (default): a cost-per-unit table of started courses.
// "Cost per Unit" appears as both the card title and a column header, so assert
// on the unambiguous tab + course-row signals instead.
export const Default: Story = {
  play: smokePlay([
    {
      role: "tab",
      name: /courses/i,
    },
    {
      role: "tab",
      name: /providers/i,
    },
    {
      text: "Course 2",
    },
  ]),
};
