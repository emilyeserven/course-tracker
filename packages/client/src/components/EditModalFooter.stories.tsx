import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

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

export const Default: Story = {};

// A new entity hides the destructive Remove button.
export const NewEntity: Story = {
  args: {
    isNew: true,
  },
};

// An existing entity shows Remove and fires onDelete.
export const Removable: Story = {};

export const Saving: Story = {
  args: {
    isSaving: true,
  },
};
