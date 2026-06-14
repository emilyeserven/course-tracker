import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DailyStatusButtons } from "./DailyStatusButtons";

const meta: Meta<typeof DailyStatusButtons> = {
  component: DailyStatusButtons,
  args: {
    onChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentStatus: "goal",
  },
};

export const IconOnly: Story = {
  args: {
    currentStatus: "touched",
    iconOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    currentStatus: "goal",
    disabled: true,
  },
};
