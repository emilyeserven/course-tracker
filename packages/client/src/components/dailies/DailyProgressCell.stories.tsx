import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyProgressCell } from "./DailyProgressCell";

import { makeDaily } from "@/test-utils/dailiesFixtures";

const meta = {
  component: DailyProgressCell,
} satisfies Meta<typeof DailyProgressCell>;

export default meta;

type Story = StoryObj<typeof meta>;

// Course/resource path: renders a radial progress trigger.
export const CourseProgress: Story = {
  args: {
    daily: makeDaily({
      resource: {
        id: "r1",
        name: "Structure and Interpretation of Computer Programs",
        progressCurrent: 5,
        progressTotal: 10,
      },
    }),
  },
};

// Resource that opts out of progress tracking: shows the infinity icon.
export const NoProgressResource: Story = {
  args: {
    daily: makeDaily({
      resource: {
        id: "r2",
        name: "MDN Web Docs",
        progressCurrent: 0,
        progressTotal: 0,
        tracksProgress: false,
      },
    }),
  },
};

// Task path: progress derived from todos + resources.
export const TaskProgress: Story = {
  args: {
    daily: makeDaily({
      task: {
        id: "t1",
        name: "Build the widget",
        progress: {
          todosTotal: 3,
          todosComplete: 2,
          resourcesTotal: 2,
          resourcesUsed: 1,
        },
      },
    }),
  },
};

// Neither resource nor task: falls back to the infinity ("Daily Drills") icon.
export const DailyDrills: Story = {
  args: {
    daily: makeDaily({}),
  },
};
