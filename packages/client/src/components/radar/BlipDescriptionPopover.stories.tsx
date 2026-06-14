import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipDescriptionPopover } from "./BlipDescriptionPopover";

const meta: Meta<typeof BlipDescriptionPopover> = {
  component: BlipDescriptionPopover,
  args: {
    value: "Container orchestration",
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
