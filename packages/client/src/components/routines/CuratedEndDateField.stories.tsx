import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { CuratedEndDateField } from "./CuratedEndDateField";

// Fixed window so the story is deterministic: today through +14 days.
const minDate = new Date("2026-07-11T00:00:00");
const maxDate = new Date("2026-07-25T00:00:00");

const meta = {
  component: CuratedEndDateField,
  args: {
    value: null,
    onSelect: fn(),
    minDate,
    maxDate,
  },
} satisfies Meta<typeof CuratedEndDateField>;

export default meta;

type Story = StoryObj<typeof meta>;

// No end date chosen yet: the trigger shows the "Pick an end date" placeholder
// and no Clear button is rendered.
export const Empty: Story = {};

// With a date selected, the trigger shows the formatted date and a Clear button
// appears alongside it.
export const WithValue: Story = {
  args: {
    value: new Date("2026-07-18T00:00:00"),
  },
};
