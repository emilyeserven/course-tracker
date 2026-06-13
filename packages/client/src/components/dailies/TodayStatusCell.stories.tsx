import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TodayStatusCell } from "./TodayStatusCell";

import { makeDaily } from "@/test-utils/dailiesFixtures";

const meta: Meta<typeof TodayStatusCell> = {
  component: TodayStatusCell,
  args: {
    daily: makeDaily({
      criteria: {
        goal: "30 min practice",
        touched: "Opened the book",
      },
    }),
    currentStatus: "goal",
    disabled: false,
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Shows the status pill trigger. Clicking opens DailyStatusModal (portals to
// body) — render-only smoke test of the trigger.
export const WithStatus: Story = {};

// No status set yet: trigger shows the dashed "Select…" placeholder.
export const Unset: Story = {
  args: {
    currentStatus: null,
  },
};
