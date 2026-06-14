import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { EditFormActions } from "./EditFormActions";

import {
  clickCancelFiresOnCancel,
  expectRemoveHidden,
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
