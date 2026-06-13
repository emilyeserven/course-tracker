import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { EmptyDash } from "./EmptyDash";

const meta: Meta<typeof EmptyDash> = {
  component: EmptyDash,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("—")).toBeInTheDocument();
  },
};

export const Small: Story = {
  args: {
    className: "text-xs",
  },
};
