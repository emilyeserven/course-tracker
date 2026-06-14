import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { EditModalFooter } from "./EditModalFooter";

import {
  clickCancelFiresOnCancel,
  expectRemoveHidden,
} from "@/test-utils/editRowStoryPlays";

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
  play: clickCancelFiresOnCancel,
};

// A new entity hides the destructive Remove button.
export const NewEntity: Story = {
  args: {
    isNew: true,
  },
  play: expectRemoveHidden,
};
