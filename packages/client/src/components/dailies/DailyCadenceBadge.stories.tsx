import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyCadenceBadge } from "./DailyCadenceBadge";

import { makeDaily } from "@/test-utils/dailiesFixtures";

const meta = {
  component: DailyCadenceBadge,
} satisfies Meta<typeof DailyCadenceBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DailyMode: Story = {
  args: {
    daily: makeDaily({
      mode: "daily",
    }),
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
    daily: makeDaily({
      mode: "weekly",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Weekly")).toBeInTheDocument();
  },
};
