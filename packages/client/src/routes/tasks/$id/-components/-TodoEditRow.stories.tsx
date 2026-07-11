import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TodoEditRow } from "./-TodoEditRow";

import { QueryStub } from "@/test-utils/QueryStub";
import { smokeText } from "@/test-utils/storyPlay";
import { makeTaskTodo } from "@/test-utils/tasksFixtures";

const meta: Meta<typeof TodoEditRow> = {
  component: TodoEditRow,
  args: {
    todo: makeTaskTodo({
      name: "Read the introduction",
    }),
    isSaving: false,
    onSave: fn(),
    onCancel: fn(),
  },
  decorators: [
    Story => (
      <QueryStub>
        <ul className="max-w-2xl rounded-md border">
          <Story />
        </ul>
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  play: smokeText("To-do", "Status", "Due date"),
};

export const NewWithDelete: Story = {
  args: {
    isNew: true,
    onDelete: fn(),
  },
  play: smokeText("Add to-do", "Delete"),
};
