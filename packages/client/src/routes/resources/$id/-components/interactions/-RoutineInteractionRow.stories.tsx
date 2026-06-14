import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineInteractionRow } from "./-RoutineInteractionRow";

const meta: Meta<typeof RoutineInteractionRow> = {
  component: RoutineInteractionRow,
  // The row is an <li>; give it a list parent so the markup is valid.
  decorators: [
    Story => (
      <ul className="max-w-xl rounded-md border bg-background">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: {
      id: "rt-1:2026-06-13",
      routineId: "rt-1",
      routineName: "Daily Spanish",
      date: "2026-06-13",
      status: "goal",
      note: "Felt good today.",
      actionLabel: "Review Spanish flashcards",
      via: "task",
    },
  },
};

// A completion logged directly against the resource (not via a task), with no
// distinct action label or note — the leanest row.
export const Minimal: Story = {
  args: {
    item: {
      id: "rt-2:2026-06-12",
      routineId: "rt-2",
      routineName: "Read a chapter",
      date: "2026-06-12",
      status: "touched",
      note: null,
      actionLabel: "Read a chapter",
      via: "resource",
    },
  },
};
