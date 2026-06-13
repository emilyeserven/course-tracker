import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "@storybook/test";

import { BlipPlacementSelect } from "./BlipPlacementSelect";

import { makeQuadrants } from "@/test-utils/radarFixtures";

const meta: Meta<typeof BlipPlacementSelect> = {
  component: BlipPlacementSelect,
  args: {
    label: "Slice",
    value: "",
    placeholder: "Pick a slice",
    options: makeQuadrants(),
    onValueChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Slice")).toBeInTheDocument();
    await expect(canvas.getByText("Pick a slice")).toBeInTheDocument();
  },
};

export const Selected: Story = {
  args: {
    value: "q1",
  },
};
