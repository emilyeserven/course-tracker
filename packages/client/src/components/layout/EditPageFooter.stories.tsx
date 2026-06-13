import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { EditPageFooter } from "./EditPageFooter";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof EditPageFooter> = {
  component: EditPageFooter,
  args: {
    isNew: false,
    onDelete: fn(() => Promise.resolve()),
    onDuplicate: fn(() => Promise.resolve()),
    children: <Button type="submit">Save</Button>,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Editing an existing entity: primary action plus the destructive controls.
export const Existing: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /Duplicate/,
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /Delete/,
      }),
    ).toBeInTheDocument();
  },
};

// New entity: destructive actions are hidden (nothing to delete/duplicate yet).
export const New: Story = {
  args: {
    isNew: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", {
        name: /Delete/,
      }),
    ).not.toBeInTheDocument();
  },
};

// DeleteButton requires a confirmation click before firing onDelete.
export const DeleteRequiresConfirm: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /Delete/,
    }));
    await expect(canvas.getByText("Are you sure?")).toBeInTheDocument();
    await expect(args.onDelete).not.toHaveBeenCalled();
  },
};
