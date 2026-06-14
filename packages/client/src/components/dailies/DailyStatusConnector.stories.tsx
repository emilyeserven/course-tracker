import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyStatusConnector } from "./DailyStatusConnector";

const meta = {
  component: DailyStatusConnector,
} satisfies Meta<typeof DailyStatusConnector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Gradient: Story = {
  args: {
    left: "goal",
    right: "exceeded",
  },
};

export const Freeze: Story = {
  args: {
    left: "freeze",
    right: "goal",
  },
};

export const Vertical: Story = {
  args: {
    left: "touched",
    right: "goal",
    orientation: "vertical",
  },
};

export const Empty: Story = {
  args: {
    left: null,
    right: null,
  },
};
