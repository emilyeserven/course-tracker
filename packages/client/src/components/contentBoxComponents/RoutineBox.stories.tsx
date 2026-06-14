import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

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

export const Daily: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Daily reading")).toBeInTheDocument();
    await expect(await canvas.findByText("Daily")).toBeInTheDocument();
    await expect(await canvas.findByText("chain")).toBeInTheDocument();
  },
};

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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Weekly")).toBeInTheDocument();
    await expect(
      await canvas.findByText("Review the backlog"),
    ).toBeInTheDocument();
  },
};

export const DailyNoTask: Story = {
  args: makeRoutine({
    name: "Stretch",
    connections: [],
    weekly: {},
  }),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The "nothing assigned" caution surfaces an accessible label.
    await expect(
      await canvas.findByLabelText("Nothing assigned"),
    ).toBeInTheDocument();
  },
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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByLabelText("Nothing assigned"),
    ).not.toBeInTheDocument();
  },
};
