import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

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

export const Default: Story = {};

// A new (unsaved) row hides the destructive Remove button.
export const NewRow: Story = {
  args: {
    isNew: true,
  },
};

// An existing row shows Remove and fires onDelete.
export const ExistingRow: Story = {};

// While saving, the Save button is disabled.
export const Saving: Story = {
  args: {
    isSaving: true,
  },
};

// Delete can be blocked with an explanatory reason.
export const DeleteDisabled: Story = {
  args: {
    deleteDisabled: true,
    deleteDisabledReason: "Remove all tags first",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};
