import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { CompletionsMonthNav } from "./CompletionsMonthNav";

import { smokeText } from "@/test-utils/storyPlay";

const june = {
  year: 2026,
  month: 5,
};

const meta: Meta<typeof CompletionsMonthNav> = {
  component: CompletionsMonthNav,
  args: {
    viewMonth: june,
    currentMonth: june,
    earliestYear: 2024,
    monthLabel: "June 2026",
    monthPickerOpen: false,
    setMonthPickerOpen: fn(),
    selectMonth: fn(),
    goToPrevMonth: fn(),
    goToNextMonth: fn(),
    canGoPrev: true,
    canGoNext: false,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const CurrentMonth: Story = {
  play: smokeText("June 2026"),
};

export const PastMonth: Story = {
  args: {
    viewMonth: {
      year: 2026,
      month: 2,
    },
    monthLabel: "March 2026",
    canGoNext: true,
  },
  play: smokeText("March 2026"),
};

export const PickerOpen: Story = {
  args: {
    monthPickerOpen: true,
  },
  play: smokeText("June 2026"),
};
