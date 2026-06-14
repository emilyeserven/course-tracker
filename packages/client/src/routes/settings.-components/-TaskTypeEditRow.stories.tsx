import type { TaskType } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { TaskTypeEditRow } from "./-TaskTypeEditRow";

const taskType: TaskType = {
  id: "task-type-1",
  name: "Practice",
  whenToUse: "When drilling a specific skill.",
  tags: ["skill:listening", "format:audio"],
};

// Renders an <li> with a self-contained TagsInput combobox; host it in a <ul>
// and don't open the combobox in play tests.
const meta: Meta<typeof TaskTypeEditRow> = {
  component: TaskTypeEditRow,
  args: {
    taskType,
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

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("Practice")).toBeInTheDocument();
    await expect(canvas.getByText("When to Use")).toBeInTheDocument();
  },
};

// A new task type hides the destructive Remove button.
export const NewType: Story = {
  args: {
    isNew: true,
    taskType: {
      id: "__new__",
      name: "",
      whenToUse: "",
      tags: [],
    },
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("button", {
        name: "Remove",
      }),
    ).not.toBeInTheDocument();
  },
};

export const Cancels: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Cancel",
    }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};
