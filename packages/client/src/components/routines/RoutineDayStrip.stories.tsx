import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineDayStrip } from "./RoutineDayStrip";

const meta: Meta<typeof RoutineDayStrip> = {
  component: RoutineDayStrip,
  args: {
    weekly: {
      1: {
        type: "task",
        id: "task-1",
      },
      3: {
        type: "task",
        id: "task-1",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PartiallyScheduled: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByTitle("2 days scheduled"),
    ).toBeInTheDocument();
  },
};

export const EmptyWeek: Story = {
  args: {
    weekly: {},
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByTitle("0 days scheduled"),
    ).toBeInTheDocument();
  },
};
