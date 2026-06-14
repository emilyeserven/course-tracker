import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { makeEmptyTagDraft } from "./-tagDrafts";
import { TagEditRow } from "./-TagEditRow";

// Renders an <li> editable form for a single tag; host it in a <ul>.
const meta: Meta<typeof TagEditRow> = {
  component: TagEditRow,
  args: {
    draft: {
      id: "tag-1",
      groupId: "tag-group-1",
      name: "skills:listening",
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

// A new tag hides the destructive Remove button.
export const NewTag: Story = {
  args: {
    isNew: true,
    draft: makeEmptyTagDraft("tag-group-1"),
  },
};
