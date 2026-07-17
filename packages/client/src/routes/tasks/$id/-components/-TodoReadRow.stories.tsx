import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TodoReadRow } from "./-TodoReadRow";

import { QueryStub } from "@/test-utils/QueryStub";
import { smokeText } from "@/test-utils/storyPlay";
import { makeTaskTodo } from "@/test-utils/tasksFixtures";

const meta: Meta<typeof TodoReadRow> = {
  component: TodoReadRow,
  args: {
    todo: makeTaskTodo({
      name: "Read the introduction",
    }),
    actionsDisabled: false,
    onToggleStatus: fn(),
    onStartEdit: fn(),
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

export const Basic: Story = {
  play: smokeText("Read the introduction"),
};

export const WithDueDateAndNote: Story = {
  args: {
    todo: makeTaskTodo({
      name: "Finish unit 2",
      dueDate: "2026-07-20",
      note: "Focus on the listening drills.",
    }),
  },
  play: smokeText("Finish unit 2", "due 2026-07-20", "Focus on the listening drills."),
};

export const WithBookmark: Story = {
  args: {
    todo: makeTaskTodo({
      name: "Work through the course page",
      bookmarks: [
        {
          id: "tb-1",
          bookmarkId: "bm-1",
          title: "Pimsleur Spanish",
          url: "https://example.com/pimsleur",
          sectionLabel: "Unit 3",
          position: 0,
        },
      ],
    }),
  },
  play: smokeText("Work through the course page", "Pimsleur Spanish"),
};
