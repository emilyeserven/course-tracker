import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ConfirmDialog } from "./ConfirmDialog";

// Controlled AlertDialog: render with `open: true`. The content portals to
// document.body, so assertions query there rather than the canvas.
const meta: Meta<typeof ConfirmDialog> = {
  component: ConfirmDialog,
  args: {
    open: true,
    title: "Delete this routine?",
    description: "This can't be undone.",
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The confirm button runs the confirm handler.
export const Confirms: Story = {};

// The cancel button runs the cancel handler.
export const Cancels: Story = {};

// Custom labels and no description.
export const CustomLabels: Story = {
  args: {
    title: "Discard changes?",
    description: undefined,
    confirmLabel: "Discard",
    cancelLabel: "Keep editing",
  },
};
