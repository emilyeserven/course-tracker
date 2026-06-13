import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

function AlertDialogDemo({
  open,
  onConfirm,
  onCancel,
}: {
  open?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const meta: Meta<typeof AlertDialogDemo> = {
  component: AlertDialogDemo,
  args: {
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Content portals to document.body.
export const Open: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(
      await body.findByText("Are you absolutely sure?"),
    ).toBeInTheDocument();
  },
};

// The action button runs the confirm handler.
export const Confirms: Story = {
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    await userEvent.click(
      await body.findByRole("button", {
        name: "Continue",
      }),
    );
    await expect(args.onConfirm).toHaveBeenCalled();
  },
};
