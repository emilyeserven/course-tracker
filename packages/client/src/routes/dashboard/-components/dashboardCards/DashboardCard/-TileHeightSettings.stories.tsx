import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TileHeightSettings } from "./-TileHeightSettings";

const meta: Meta<typeof TileHeightSettings> = {
  component: TileHeightSettings,
  args: {
    mode: "auto",
    h: 4,
    minH: 2,
    maxH: 12,
    onChange: fn(),
    onHeightChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Auto mode hides the numeric row input.
export const Auto: Story = {};

// Fixed mode reveals the numeric row input next to the chooser.
export const Fixed: Story = {
  args: {
    mode: "fixed",
  },
};
