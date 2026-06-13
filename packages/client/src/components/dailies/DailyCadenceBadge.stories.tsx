import type { Daily } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "@storybook/test";

import { DailyCadenceBadge } from "./DailyCadenceBadge";

function makeDaily(mode: Daily["mode"], name = "Morning reading"): Daily {
  return {
    id: "r1",
    name,
    completions: [],
    mode,
  };
}

const meta = {
  component: DailyCadenceBadge,
} satisfies Meta<typeof DailyCadenceBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DailyMode: Story = {
  args: {
    daily: makeDaily("daily"),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Daily")).toBeInTheDocument();
  },
};

export const WeeklyMode: Story = {
  args: {
    daily: makeDaily("weekly"),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Weekly")).toBeInTheDocument();
  },
};
