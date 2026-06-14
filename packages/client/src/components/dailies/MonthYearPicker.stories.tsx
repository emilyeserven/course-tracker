import type { ViewMonth } from "./MonthYearPicker";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { MonthYearPicker } from "./MonthYearPicker";

const currentMonth: ViewMonth = {
  year: 2026,
  month: 5,
};

const meta: Meta<typeof MonthYearPicker> = {
  component: MonthYearPicker,
  args: {
    onChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentMonth: Story = {
  args: {
    viewMonth: currentMonth,
    currentMonth,
    earliestYear: 2024,
  },
};
