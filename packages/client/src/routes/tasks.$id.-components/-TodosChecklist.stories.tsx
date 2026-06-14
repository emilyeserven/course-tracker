import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TodosChecklist } from "./-TodosChecklist";

import { makeTask } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { makeTaskTodo } from "@/test-utils/tasksFixtures";

const meta = {
  component: TodosChecklist,
  args: {
    task: makeTask({
      todos: [
        makeTaskTodo({
          id: "todo-1",
          name: "Read the introduction",
          isComplete: true,
        }),
        makeTaskTodo({
          id: "todo-2",
          name: "Watch the overview video",
          url: "https://example.com/video",
        }),
        makeTaskTodo({
          id: "todo-3",
          name: "Set up the project",
        }),
      ],
    }),
  },
  decorators: [
    Story => (
      <QueryStub>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof TodosChecklist>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A populated checklist: completed items are struck through, linked ones get a Go button. */
export const WithTodos: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const completed = canvas.getByText("Read the introduction");
    await expect(completed).toBeInTheDocument();
    await expect(completed.className).toContain("line-through");
    await expect(
      canvas.getByRole("link", {
        name: "Open link for Watch the overview video",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText("Add a to-do...")).toBeInTheDocument();
  },
};

/** With no todos the empty hint shows above the add form. */
export const Empty: Story = {
  args: {
    task: makeTask({
      todos: [],
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No to-dos yet.")).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText("Add a to-do...")).toBeInTheDocument();
  },
};
