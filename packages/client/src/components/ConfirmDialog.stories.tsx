import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { ConfirmDialog } from "./ConfirmDialog";

import { playClickDialogButton } from "@/test-utils/storyPlays";

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

export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(
      await body.findByText("Delete this routine?"),
    ).toBeInTheDocument();
    await expect(body.getByText("This can't be undone.")).toBeInTheDocument();
  },
};

// The confirm button runs the confirm handler.
export const Confirms: Story = {
  play: playClickDialogButton("Yes"),
};
