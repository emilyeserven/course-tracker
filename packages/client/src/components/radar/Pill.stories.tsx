import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "@storybook/test";

import { Pill } from "./Pill";

const meta = {
  component: Pill,
  args: {
    children: "Pill",
  },
} satisfies Meta<typeof Pill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Pill")).toBeInTheDocument();
  },
};

/** A status badge: the base pill styles overridden via className (tailwind-merge). */
export const NewTopicBadge: Story = {
  args: {
    children: "New topic",
    className: "rounded-sm bg-emerald-100 px-1.5 text-[10px] text-emerald-800",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("New topic");
    await expect(pill).toBeInTheDocument();
    await expect(pill.className).toContain("rounded-sm");
    await expect(pill.className).not.toContain("rounded-full");
  },
};

export const ExistingTopicBadge: Story = {
  args: {
    children: "Existing topic",
    className: "rounded-sm bg-blue-100 px-1.5 text-[10px] text-blue-800",
  },
};

export const OnRadarBadge: Story = {
  args: {
    children: "On radar",
    className: "rounded-sm bg-amber-200 px-1.5 text-[10px] text-amber-900",
  },
};
