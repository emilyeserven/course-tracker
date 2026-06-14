import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { FilterOptionCount } from "./FilterOptionCount";

const meta = {
  component: FilterOptionCount,
  args: {
    count: 12,
  },
} satisfies Meta<typeof FilterOptionCount>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("12")).toBeInTheDocument();
  },
};

export const Zero: Story = {
  args: {
    count: 0,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("0")).toBeInTheDocument();
  },
};
