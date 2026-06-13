import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyStatusCircle } from "./DailyStatusCircle";

const meta = {
  component: DailyStatusCircle,
} satisfies Meta<typeof DailyStatusCircle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Goal: Story = {
  args: {
    status: "goal",
    title: "Goal met",
  },
};

export const Empty: Story = {
  args: {
    status: null,
    title: "No entry",
  },
};

export const Highlighted: Story = {
  args: {
    status: "exceeded",
    highlight: true,
    size: "lg",
  },
};
