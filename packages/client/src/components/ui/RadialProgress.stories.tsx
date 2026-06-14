import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadialProgress } from "./RadialProgress";

const meta = {
  component: RadialProgress,
  args: {
    current: 3,
    total: 4,
    size: 48,
  },
} satisfies Meta<typeof RadialProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// total of 0 must not divide by zero — it renders 0%.
export const Empty: Story = {
  args: {
    current: 0,
    total: 0,
  },
};

export const Full: Story = {
  args: {
    current: 5,
    total: 5,
  },
};

// A custom `title` overrides the tooltip, but the aria-label stays percentage.
export const CustomTitle: Story = {
  args: {
    current: 1,
    total: 2,
    title: "Halfway there",
  },
};
