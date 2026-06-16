import type { Meta, StoryObj } from "@storybook/react-vite";

import { TodosEditor } from "./-TodosEditor";

import { makeTask } from "@/test-utils/boxFixtures";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";
import { makeTaskTodo } from "@/test-utils/tasksFixtures";

const meta: Meta<typeof TodosEditor> = {
  component: TodosEditor,
  args: {
    task: makeTask({
      todos: [
        makeTaskTodo({
          id: "todo-1",
          name: "Read the introduction",
          status: "goal",
          dueDate: "2026-06-20",
        }),
        makeTaskTodo({
          id: "todo-2",
          name: "Build the sample app",
          status: "incomplete",
        }),
      ],
    }),
  },
  decorators: [queryStoryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Read the introduction", "Build the sample app", "Add To-Do"),
};

export const Empty: Story = {
  args: {
    task: makeTask({
      todos: [],
    }),
  },
  play: smokeText("No to-dos yet.", "Add To-Do"),
};
