import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineStreakStats } from "./RoutineStreakStats";

const meta: Meta<typeof RoutineStreakStats> = {
  component: RoutineStreakStats,
  args: {
    completions: [],
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoCompletions: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByTitle("Current day chain"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByTitle("Total completed days"),
    ).toBeInTheDocument();
  },
};

// Fixed past dates: the total counts them, the current chain (anchored to
// today) stays deterministic at 0.
export const WithHistory: Story = {
  args: {
    completions: [
      {
        date: "2026-06-10",
        status: "goal",
      },
      {
        date: "2026-06-11",
        status: "exceeded",
      },
    ],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const total = await canvas.findByTitle("Total completed days");
    await expect(within(total).getByText("2")).toBeInTheDocument();
  },
};
