import type { DailyCompletionRow } from "@/hooks/useDailyCompletions";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DailyCompletionEntryRow } from "./DailyCompletionEntryRow";

import { RouterStub } from "@/test-utils/RouterStub";
import { smokeText } from "@/test-utils/storyPlay";

const baseRow: DailyCompletionRow = {
  dateKey: "2026-06-11",
  status: "goal",
  note: null,
  dateLabel: "Thu, Jun 11",
  hasStatusEntry: true,
  isFuture: false,
  isToday: false,
  hasActions: true,
  isExpanded: false,
  showVerticalConnector: false,
  nextStatus: null,
  scheduledEntry: null,
  bakedParts: null,
};

const meta: Meta<typeof DailyCompletionEntryRow> = {
  component: DailyCompletionEntryRow,
  args: {
    row: baseRow,
    taskNames: new Map([["task-1", "Spanish drills"]]),
    mutationPending: false,
    onToggleExpanded: fn(),
    onSetStatus: fn(),
    onSetNote: fn(),
    onDeleteEntry: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <ul className="max-w-2xl divide-y rounded-md border">
          <Story />
        </ul>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Logged: Story = {
  play: smokeText("Thu, Jun 11"),
};

export const WithBakedSentence: Story = {
  args: {
    row: {
      ...baseRow,
      bakedParts: {
        prependText: "Review",
        name: "Spanish flashcards",
        appendText: "for 10 minutes",
      },
    },
  },
  play: smokeText(/Spanish flashcards/),
};

export const WithScheduledEntryFallback: Story = {
  args: {
    row: {
      ...baseRow,
      scheduledEntry: {
        type: "task",
        id: "task-1",
      },
    },
  },
  play: smokeText("Spanish drills"),
};

export const WithNote: Story = {
  args: {
    row: {
      ...baseRow,
      note: "Felt easy today.",
    },
  },
  play: smokeText("Felt easy today."),
};

export const FutureUnlogged: Story = {
  args: {
    row: {
      ...baseRow,
      status: null,
      hasStatusEntry: false,
      isFuture: true,
      hasActions: false,
    },
  },
  play: smokeText("Thu, Jun 11"),
};
