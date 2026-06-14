import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { SelectAllCheckbox } from "./SelectAllCheckbox";

import {
  playExpectChecked,
  playExpectDisabled,
  playToggleCheckbox,
} from "@/test-utils/storyPlays";

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

export const Unchecked: Story = {
  play: playToggleCheckbox,
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  play: playExpectChecked,
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole<HTMLInputElement>("checkbox");
    await expect(checkbox.indeterminate).toBe(true);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: playExpectDisabled("checkbox"),
};
