import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineScheduleEntryList } from "./-RoutineScheduleEntryList";

import { RouterStub } from "@/test-utils/RouterStub";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof RoutineScheduleEntryList> = {
  component: RoutineScheduleEntryList,
  args: {
    rows: [
      {
        key: "1",
        label: "Monday",
        entry: {
          type: "task",
          id: "task-1",
        },
      },
      {
        key: "2",
        label: "Tuesday",
        entry: undefined,
      },
    ],
    taskNames: new Map([["task-1", "Read a chapter"]]),
    gridClass: "grid grid-cols-[120px_1fr]",
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// A scheduled weekday plus an unscheduled one (the "Nothing scheduled" arm).
export const WeekdayRows: Story = {
  play: smokeText("Monday", "Read a chapter", "Nothing scheduled"),
};

// Date-keyed rows as the curated schedule renders them (wider label column).
export const DateRows: Story = {
  args: {
    rows: [
      {
        key: "2026-07-17",
        label: "Thu, Jul 17",
        entry: {
          type: "bookmark",
          id: "bm-1",
          title: "Reference doc",
        },
      },
    ],
    gridClass: "grid grid-cols-[150px_1fr]",
  },
  play: smokeText("Thu, Jul 17", "Reference doc"),
};
