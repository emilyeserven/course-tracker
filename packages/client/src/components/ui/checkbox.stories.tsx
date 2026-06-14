import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  args: {
    "aria-label": "Accept terms",
    "onCheckedChange": fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
