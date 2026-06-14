import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddDialogFooter } from "./QuickAddDialogFooter";

const meta: Meta<typeof QuickAddDialogFooter> = {
  component: QuickAddDialogFooter,
  args: {
    submitLabel: "Save",
    isPending: false,
    canSubmit: true,
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Both buttons render, submit is enabled, and Cancel calls onCancel.
export const Default: Story = {
  play: async ({
    args,
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Save",
    })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Cancel",
    }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};

// While the create mutation is in flight the submit button is disabled.
export const Pending: Story = {
  args: {
    isPending: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Save",
    })).toBeDisabled();
  },
};

// With insufficient input the submit button is disabled.
export const CannotSubmit: Story = {
  args: {
    canSubmit: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Save",
    })).toBeDisabled();
  },
};
