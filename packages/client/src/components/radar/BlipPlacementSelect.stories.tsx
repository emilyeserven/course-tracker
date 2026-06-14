import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

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

export const Empty: Story = {};

export const Selected: Story = {
  args: {
    value: "q1",
  },
};
