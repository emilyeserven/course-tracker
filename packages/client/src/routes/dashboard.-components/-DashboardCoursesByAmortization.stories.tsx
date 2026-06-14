import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DashboardCoursesByAmortization } from "./-DashboardCoursesByAmortization";

import { makeProvider, makeResources } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

function seededClient() {
  return seededQueryClient([
    [["resources"], makeResources()],
    [["providers"], [makeProvider()]],
  ]);
}

const meta: Meta<typeof DashboardCoursesByAmortization> = {
  component: DashboardCoursesByAmortization,
  args: {
    tile: makeTile("coursesByAmortization"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={seededClient()}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Courses tab (default): a cost-per-unit table of started courses.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // "Cost per Unit" appears as both the card title and a column header, so
    // assert on the unambiguous tab + course-row signals instead.
    await expect(
      await canvas.findByRole("tab", {
        name: /courses/i,
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", {
        name: /providers/i,
      }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText("Course 2")).toBeInTheDocument();
  },
};
