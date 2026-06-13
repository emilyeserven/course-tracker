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

export const AsChild: Story = {
  args: {
    asChild: true,
    className: "mt-0.5 ml-4",
    children: <p>Rendered as a block paragraph</p>,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const hint = canvas.getByText("Rendered as a block paragraph");
    await expect(hint.tagName).toBe("P");
  },
};
