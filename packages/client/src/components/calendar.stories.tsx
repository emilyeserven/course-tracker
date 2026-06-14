import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Calendar } from "./calendar";

// `Calendar` proxies DayPicker, whose props are a wide discriminated union, so
// story args can't be inferred. Wrap it in a fixed demo to keep typing simple.
function CalendarDemo() {
  return (
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 5, 1)}
    />
  );
}

const meta: Meta<typeof CalendarDemo> = {
  component: CalendarDemo,
  decorators: [
    Story => (
      <div className="w-fit">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // A full month grid renders a day button per day plus prev/next nav.
    await expect(canvas.getAllByRole("button").length).toBeGreaterThan(20);
  },
};
