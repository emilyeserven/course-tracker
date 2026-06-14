import type { TodoistTask } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TodoistTaskList } from "./-TodoistTaskList";

const tasks: TodoistTask[] = [
  {
    id: "t1",
    content: "Finish the conjugation drills",
    url: "https://app.todoist.com/app/task/t1",
    priority: 4,
    due: "Today",
    dueDate: "2026-06-14",
    isRecurring: true,
    project: "Spanish",
    labels: ["study", "daily"],
    description: "Focus on the subjunctive",
  },
  {
    id: "t2",
    content: "Review flashcards",
    url: "https://app.todoist.com/app/task/t2",
    priority: 2,
    due: null,
    dueDate: null,
    isRecurring: false,
    project: null,
    labels: [],
    description: "",
  },
];

const meta: Meta<typeof TodoistTaskList> = {
  component: TodoistTaskList,
  args: {
    tasks,
    overdue: false,
    completingId: null,
    onComplete: fn(),
    display: {
      showProject: true,
      showLabels: true,
      showDescription: true,
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overdue: Story = {
  args: {
    overdue: true,
  },
};
