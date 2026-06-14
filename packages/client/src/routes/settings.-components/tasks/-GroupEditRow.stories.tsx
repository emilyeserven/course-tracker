import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { GroupEditRow } from "./-GroupEditRow";
import { makeEmptyGroupDraft } from "./-tagDrafts";

// Renders an <li> editable form for a tag group; host it in a <ul>.
const meta: Meta<typeof GroupEditRow> = {
  component: GroupEditRow,
  args: {
    draft: {
      id: "tag-group-1",
      name: "skills",
      description: "What this group is for",
      color: "blue",
    },
    onSave: fn(),
    onCancel: fn(),
    onDelete: fn(),
  },
  decorators: [
    Story => (
      <ul className="max-w-xl">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A new group hides the destructive Remove button.
export const NewGroup: Story = {
  args: {
    isNew: true,
    draft: makeEmptyGroupDraft(),
  },
};

// Delete is disabled while the group still has tags.
export const DeleteBlocked: Story = {
  args: {
    deleteDisabled: true,
    deleteDisabledReason: "Remove all tags first",
  },
};
