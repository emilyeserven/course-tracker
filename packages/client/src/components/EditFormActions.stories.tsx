import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { EditFormActions } from "./EditFormActions";

const meta: Meta<typeof EditFormActions> = {
  component: EditFormActions,
  args: {
    isSaving: false,
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

// A new (unsaved) row hides the destructive Remove button.
export const NewRow: Story = {
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

// An existing row shows Remove and fires onDelete.
export const ExistingRow: Story = {
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

// While saving, the Save button is disabled.
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

// Delete can be blocked with an explanatory reason.
export const DeleteDisabled: Story = {
  args: {
    deleteDisabled: true,
    deleteDisabledReason: "Remove all tags first",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Remove",
    })).toBeDisabled();
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};
