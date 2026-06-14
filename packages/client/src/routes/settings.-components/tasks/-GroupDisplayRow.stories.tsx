import type { TagGroup } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { GroupDisplayRow } from "./-GroupDisplayRow";

const group: TagGroup = {
  id: "tag-group-1",
  name: "skills",
  description: "Grouping for skill-area tags",
  color: null,
  position: 0,
  tags: [
    {
      id: "tag-1",
      groupId: "tag-group-1",
      name: "skills:listening",
      color: null,
      position: 0,
    },
    {
      id: "tag-2",
      groupId: "tag-group-1",
      name: "skills:reading",
      color: null,
      position: 1,
    },
  ],
};

// Renders an <li> holding a group header and its nested tag list; host in a <ul>.
const meta: Meta<typeof GroupDisplayRow> = {
  component: GroupDisplayRow,
  args: {
    group,
    isAnyEditing: false,
    onEdit: fn(),
    creatingTag: false,
    onStartCreateTag: fn(),
    onCancelCreateTag: fn(),
    onCreateTag: fn(),
    isCreatingTag: false,
    editingTagId: null,
    onStartEditTag: fn(),
    onCancelEditTag: fn(),
    onUpsertTag: fn(),
    onDeleteTag: fn(),
    isTagBusy: false,
  },
  decorators: [
    Story => (
      <ul className="max-w-2xl">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A group with no tags shows the empty hint.
export const NoTags: Story = {
  args: {
    group: {
      ...group,
      tags: [],
    },
  },
};

// One of the tags is being edited inline.
export const EditingTag: Story = {
  args: {
    isAnyEditing: true,
    editingTagId: "tag-1",
  },
};
