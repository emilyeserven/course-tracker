import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineDetailsContent } from "./-RoutineDetailsContent";

import { makeRoutine, makeResources, makeTask } from "@/test-utils/boxFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta = {
  component: RoutineDetailsContent,
  args: {
    data: makeRoutine(),
  },
  // useTaskResourceNames reads the task/resource lists to resolve weekly-schedule
  // entry names.
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [["tasks"], [makeTask()]],
        [["resources"], makeResources()],
      ]),
    ),
  ],
} satisfies Meta<typeof RoutineDetailsContent>;

export default meta;

type Story = StoryObj<typeof meta>;

// Daily routine (fixture default): Type/Status/Stats tiles + connected entities.
export const Default: Story = {
  play: smokePlay([
    {
      text: "Daily Task",
    },
    {
      text: "Connected To",
    },
    {
      text: "Read a chapter",
    },
  ]),
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
