import type { Tag } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TagDisplayRow } from "./-TagDisplayRow";

const tag: Tag = {
  id: "tag-1",
  groupId: "tag-group-1",
  name: "skills:listening",
  color: null,
  position: 0,
};

// Renders an <li>; host it in a <ul>.
const meta: Meta<typeof TagDisplayRow> = {
  component: TagDisplayRow,
  args: {
    tag,
    isAnyEditing: false,
    onEdit: fn(),
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

// The edit button is disabled while another row is being edited.
export const EditingElsewhere: Story = {
  args: {
    isAnyEditing: true,
  },
};
