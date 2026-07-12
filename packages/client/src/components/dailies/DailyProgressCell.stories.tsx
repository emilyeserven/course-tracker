import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyProgressCell } from "./DailyProgressCell";

import { makeDaily } from "@/test-utils/dailiesFixtures";

const meta = {
  component: DailyProgressCell,
} satisfies Meta<typeof DailyProgressCell>;

export default meta;

type Story = StoryObj<typeof meta>;

// Task path: progress derived from todos.
export const TaskProgress: Story = {
  args: {
    daily: makeDaily({
      task: {
        id: "t1",
        name: "Build the widget",
        progress: {
          todosTotal: 3,
          todosComplete: 2,
        },
      },
    }),
  },
};

// No linked task: falls back to the infinity ("Daily Drills") icon.
export const DailyDrills: Story = {
  args: {
    daily: makeDaily({}),
  },
};
