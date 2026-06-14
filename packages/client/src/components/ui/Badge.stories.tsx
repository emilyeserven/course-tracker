import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
  component: Badge,
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

/** The base styles overridden via className (tailwind-merge) — radar reuses Badge
 * as a small square tag. */
export const SmallSquareTag: Story = {
  args: {
    children: "New topic",
    className:
      "rounded-sm border-transparent bg-emerald-100 px-1.5 text-[10px] text-emerald-800",
  },
};
