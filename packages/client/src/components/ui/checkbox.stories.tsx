import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { Checkbox } from "./checkbox";

import {
  playExpectChecked,
  playExpectDisabled,
  playToggleCheckbox,
} from "@/test-utils/storyPlays";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  args: {
    "aria-label": "Accept terms",
    "onCheckedChange": fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: playToggleCheckbox,
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  play: playExpectChecked,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: playExpectDisabled("checkbox"),
};
