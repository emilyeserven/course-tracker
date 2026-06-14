import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { EditFormActions } from "./EditFormActions";

import {
  clickCancelFiresOnCancel,
  clickRemoveFiresOnDelete,
  expectRemoveHidden,
  expectSaveDisabled,
} from "@/test-utils/editRowStoryPlays";

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
  play: clickCancelFiresOnCancel,
};

// A new (unsaved) row hides the destructive Remove button.
export const NewRow: Story = {
  args: {
    isNew: true,
  },
  play: expectRemoveHidden,
};

// An existing row shows Remove and fires onDelete.
export const ExistingRow: Story = {
  play: clickRemoveFiresOnDelete,
};

// While saving, the Save button is disabled.
export const Saving: Story = {
  args: {
    isSaving: true,
  },
  play: expectSaveDisabled,
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
    await expect(
      canvas.getByRole("button", {
        name: "Remove",
      }),
    ).toBeDisabled();
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};
