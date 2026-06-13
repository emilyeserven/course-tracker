import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { EmptyHint } from "./EmptyHint";

const meta: Meta<typeof EmptyHint> = {
  component: EmptyHint,
  args: {
    children: "No connections",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No connections")).toBeInTheDocument();
  },
};
