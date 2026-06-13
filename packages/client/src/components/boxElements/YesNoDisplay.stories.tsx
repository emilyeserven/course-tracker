import type { Meta, StoryObj } from "@storybook/react-vite";

import { within, expect } from "storybook/test";

import { YesNoDisplay } from "./YesNoDisplay";

const meta = {
  component: YesNoDisplay,
  args: {
    value: true,
  },
} satisfies Meta<typeof YesNoDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Yes: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Yes")).toBeInTheDocument();
  },
};

export const No: Story = {
  args: {
    value: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No")).toBeInTheDocument();
  },
};
