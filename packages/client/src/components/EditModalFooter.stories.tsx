import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { EditModalFooter } from "./EditModalFooter";

const meta: Meta<typeof EditModalFooter> = {
  component: EditModalFooter,
  args: {
    onCancel: fn(),
    onDelete: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Cancel",
    }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};

// A new entity hides the destructive Remove button.
export const NewEntity: Story = {
  args: {
    isNew: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("button", {
        name: "Remove",
      }),
    ).not.toBeInTheDocument();
  },
};

// An existing entity shows Remove and fires onDelete.
export const Removable: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove",
    }));
    await expect(args.onDelete).toHaveBeenCalled();
  },
};

export const Saving: Story = {
  args: {
    isSaving: true,
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
