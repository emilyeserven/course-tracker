import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineDetailsContent } from "./-RoutineDetailsContent";

import { makeRoutine, makeResources, makeTask } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

// useTaskResourceNames reads the task/resource lists to resolve weekly-schedule
// entry names.
function seededClient() {
  return seededQueryClient([
    [["tasks"], [makeTask()]],
    [["resources"], makeResources()],
  ]);
}

const meta = {
  component: RoutineDetailsContent,
  args: {
    data: makeRoutine(),
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
} satisfies Meta<typeof RoutineDetailsContent>;

export default meta;

type Story = StoryObj<typeof meta>;

// Daily routine (fixture default): Type/Status/Stats tiles + connected entities.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Daily Task")).toBeInTheDocument();
    await expect(canvas.getByText("Connected To")).toBeInTheDocument();
    await expect(canvas.getByText("Read a chapter")).toBeInTheDocument();
  },
};

// Weekly routine adds the day-by-day schedule section.
export const Weekly: Story = {
  args: {
    data: makeRoutine({
      mode: "weekly",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // "Weekly Schedule" appears twice in weekly mode: the Type tile value and
    // the schedule section header.
    const headings = await canvas.findAllByText("Weekly Schedule");
    await expect(headings.length).toBeGreaterThanOrEqual(2);
  },
};
