import type { Meta, StoryObj } from "@storybook/react-vite";

import { within, expect } from "storybook/test";

import { Description } from "./Description";

const meta = {
  component: Description,
  args: {
    description: "A thorough introduction to the topic.",
  },
} satisfies Meta<typeof Description>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("A thorough introduction to the topic."),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    description: null,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("No description provided."),
    ).toBeInTheDocument();
  },
};
