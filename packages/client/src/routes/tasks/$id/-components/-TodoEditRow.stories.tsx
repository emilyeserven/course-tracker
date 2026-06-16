import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TodoEditRow } from "./-TodoEditRow";

import { smokeText } from "@/test-utils/storyPlay";
import { makeTaskTodo } from "@/test-utils/tasksFixtures";

const meta: Meta<typeof TodoEditRow> = {
  component: TodoEditRow,
  args: {
    todo: makeTaskTodo({
      name: "Read the introduction",
    }),
    resourceOptions: [
      {
        id: "resource-1",
        name: "Starter repo",
      },
    ],
    moduleGroups: [],
    modules: [],
    isSaving: false,
    onSave: fn(),
    onCancel: fn(),
  },
  decorators: [
    Story => (
      <ul className="max-w-2xl rounded-md border">
        <Story />
      </ul>
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
