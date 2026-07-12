import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { weeklyToRows } from "./weekly";
import { WeeklyScheduleField } from "./WeeklyScheduleField";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { taskOptions } from "@/test-utils/routinesFixtures";

const meta: Meta<typeof WeeklyScheduleField> = {
  component: WeeklyScheduleField,
  args: {
    value: weeklyToRows(undefined),
    onChange: fn(),
    taskOptions,
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Empty grid: every weekday row is blank. The seven Monday-first day labels render.
export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Monday")).toBeInTheDocument();
    await expect(canvas.getByText("Sunday")).toBeInTheDocument();
  },
};

// A populated grid: a task on Monday and a freeform entry on Friday. The type
// selects reflect the stored entries.
export const Populated: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "task",
        id: "task-1",
      },
      5: {
        type: "freeform",
        id: "Stretch for 10 minutes",
      },
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const mondayType = await canvas.findByLabelText("Monday type");
    await expect(mondayType).toHaveValue("task");
    await expect(canvas.getByLabelText("Friday type")).toHaveValue("freeform");
  },
};
