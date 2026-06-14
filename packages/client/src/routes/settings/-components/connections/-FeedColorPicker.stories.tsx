import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { FEED_COLORS, FeedColorPicker } from "./-FeedColorPicker";

const meta: Meta<typeof FeedColorPicker> = {
  component: FeedColorPicker,
  args: {
    value: FEED_COLORS[0],
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A non-default swatch is selected.
export const SecondColor: Story = {
  args: {
    value: FEED_COLORS[1],
  },
};
