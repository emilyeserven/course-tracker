import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineBox } from "./RoutineBox";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof RoutineBox> = {
  component: RoutineBox,
  args: makeRoutine(),
  decorators: [cardStoryDecorator({
    tooltip: true,
    constrained: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Daily: Story = {};

export const Weekly: Story = {
  args: makeRoutine({
    name: "Weekly review",
    mode: "weekly",
    todayAction: {
      name: "Review the backlog",
      prependText: "Time to",
      appendText: "for today",
    },
  }),
};

export const DailyNoTask: Story = {
  args: makeRoutine({
    name: "Stretch",
    connections: [],
    weekly: {},
  }),
};

export const DailyResourceNoWarning: Story = {
  args: makeRoutine({
    name: "Read the docs",
    connections: [],
    // A daily routine assigned a resource (not a task) still counts as
    // assigned, so the caution must not appear.
    weekly: {
      1: {
        type: "resource",
        id: "res-1",
      },
    },
  }),
};
