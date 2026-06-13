import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Badge } from "./badge";

const meta = {
  component: Badge,
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Badge")).toBeInTheDocument();
  },
};

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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("New topic");
    await expect(badge).toBeInTheDocument();
    await expect(badge.className).toContain("rounded-sm");
    await expect(badge.className).not.toContain("rounded-md");
  },
};
