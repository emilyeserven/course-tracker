import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { SelectAllCheckbox } from "./SelectAllCheckbox";

const meta: Meta<typeof SelectAllCheckbox> = {
  component: SelectAllCheckbox,
  args: {
    "aria-label": "Select all",
    "checked": false,
    "indeterminate": false,
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

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
