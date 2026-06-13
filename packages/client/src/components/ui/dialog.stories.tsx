import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function DialogDemo({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const meta: Meta<typeof DialogDemo> = {
  component: DialogDemo,
  args: {
    open: true,
    onOpenChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Dialog content portals to document.body.
export const Open: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Edit profile")).toBeInTheDocument();
    await expect(
      body.getByText("Make changes to your profile here."),
    ).toBeInTheDocument();
  },
};

// The close control requests a close via onOpenChange.
export const ClosesOnCancel: Story = {
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    await userEvent.click(await body.findByText("Cancel"));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
