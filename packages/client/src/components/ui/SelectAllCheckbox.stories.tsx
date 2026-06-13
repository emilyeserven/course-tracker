import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "@storybook/test";

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

export const Unchecked: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", {
      name: "Select all",
    });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox")).toBeChecked();
  },
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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox")).toBeDisabled();
  },
};
