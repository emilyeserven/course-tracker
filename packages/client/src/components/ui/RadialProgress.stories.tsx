import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RadialProgress } from "./RadialProgress";

const meta = {
  component: RadialProgress,
  args: {
    current: 3,
    total: 4,
    size: 48,
  },
} satisfies Meta<typeof RadialProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", {
        name: "75% complete",
      }),
    ).toBeInTheDocument();
  },
};

// total of 0 must not divide by zero — it renders 0%.
export const Empty: Story = {
  args: {
    current: 0,
    total: 0,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", {
        name: "0% complete",
      }),
    ).toBeInTheDocument();
  },
};
