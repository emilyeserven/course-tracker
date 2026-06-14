import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TagChip } from "./TagChip";

const meta = {
  component: TagChip,
  args: {
    tag: "frontend",
  },
} satisfies Meta<typeof TagChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("frontend")).toBeInTheDocument();
  },
};

/** Grouped tags carry a `group:value` label. */
export const Prefixed: Story = {
  args: {
    tag: "lang:typescript",
  },
};
