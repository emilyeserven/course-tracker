import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineTodayCard } from "./-RoutineTodayCard";

import { makeRoutine, makeResources, makeTask } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { smokePlay } from "@/test-utils/storyPlay";
import { getTodayKey } from "@/utils";

// A "YYYY-MM-DD" key `days` after today, built in UTC to match the curated date
// keys (curatedDateRange resolves them the same way).
function dateKeyOffset(days: number): string {
  const d = new Date(`${getTodayKey()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const meta = {
  component: RoutineTodayCard,
  args: {
    data: makeRoutine(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub
          client={seededQueryClient([
            [["tasks"], [makeTask()]],
            [["resources"], makeResources()],
            [["modules-all"], []],
            [["module-groups-all"], []],
          ])}
        >
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof RoutineTodayCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Daily routine: today's entry plus the today-status control.
export const Default: Story = {
  play: smokePlay([{
    text: "Today's Task",
  }]),
};

// A routine with nothing scheduled today shows the rest-day copy.
export const NothingToday: Story = {
  args: {
    data: makeRoutine({
      mode: "weekly",
      weekly: {},
    }),
  },
  play: smokePlay([{
    text: /nothing, take a break/i,
  }]),
};

// Curated routine: today's entry is keyed by absolute date (weekly is empty), so
// the card resolves it from curated.entries rather than the weekday grid.
export const Curated: Story = {
  args: {
    data: makeRoutine({
      mode: "curated",
      weekly: {},
      curated: {
        endDate: dateKeyOffset(2),
        entries: {
          [getTodayKey()]: {
            type: "resource",
            id: "resource-1",
          },
        },
      },
    }),
  },
  play: smokePlay([{
    text: "Course 1",
  }]),
};
