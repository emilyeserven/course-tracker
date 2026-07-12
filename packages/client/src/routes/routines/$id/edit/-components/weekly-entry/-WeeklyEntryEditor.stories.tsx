import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { WeeklyEntryEditor } from "./-WeeklyEntryEditor";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { taskOptions } from "@/test-utils/routinesFixtures";

const meta: Meta<typeof WeeklyEntryEditor> = {
  component: WeeklyEntryEditor,
  args: {
    type: "task",
    id: "task-1",
    notes: "",
    location: "",
    prependText: "",
    appendText: "",
    onChange: fn(),
    taskOptions,
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TaskEntry: Story = {};

export const Freeform: Story = {
  args: {
    type: "freeform",
    id: "Stretch for 10 minutes",
  },
};

// Prepend/append text around a resolved item name renders the actionable-sentence
// preview.
export const WithPreview: Story = {
  args: {
    type: "task",
    id: "task-1",
    prependText: "Review",
    appendText: "for 10 minutes",
  },
};

// type "" (None): the meta/notes inputs collapse to just the type select.
export const None: Story = {
  args: {
    type: "",
    id: "",
  },
};
