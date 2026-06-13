import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyRecentDaysStrip } from "./DailyRecentDaysStrip";

import { makeDaily, makeRecentCompletions } from "@/test-utils/dailiesFixtures";

const meta = {
  component: DailyRecentDaysStrip,
  args: {
    daily: makeDaily({
      completions: makeRecentCompletions([
        "goal",
        "touched",
        "goal",
        "exceeded",
        "freeze",
        "goal",
        "goal",
      ]),
    }),
  },
} satisfies Meta<typeof DailyRecentDaysStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

// Large circles with day-of-week labels.
export const LargeWithLabels: Story = {
  args: {
    size: "xl",
    showLabels: true,
  },
};

// Month/day label format instead of day-of-week.
export const MonthDayLabels: Story = {
  args: {
    labelFormat: "mmdd",
  },
};
