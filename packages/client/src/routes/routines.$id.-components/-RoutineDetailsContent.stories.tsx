import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineDetailsContent } from "./-RoutineDetailsContent";

import { makeRoutine, makeResources, makeTask } from "@/test-utils/boxFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
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
  component: RoutineDetailsContent,
  args: {
    data: makeRoutine(),
  },
  // useTaskResourceNames reads the task/resource lists to resolve weekly-schedule
  // entry names.
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [["tasks"], [makeTask()]],
        [["resources"], makeResources()],
      ]),
    ),
  ],
} satisfies Meta<typeof RoutineDetailsContent>;

export default meta;

type Story = StoryObj<typeof meta>;

// Daily routine (fixture default): Type/Status/Stats tiles + connected entities.
export const Default: Story = {
  play: smokePlay([
    {
      text: "Daily Task",
    },
    {
      text: "Connected To",
    },
    {
      text: "Read a chapter",
    },
  ]),
};

// Weekly routine adds the day-by-day schedule section.
export const Weekly: Story = {
  args: {
    data: makeRoutine({
      mode: "weekly",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // "Weekly Schedule" appears twice in weekly mode: the Type tile value and
    // the schedule section header.
    const headings = await canvas.findAllByText("Weekly Schedule");
    await expect(headings.length).toBeGreaterThanOrEqual(2);
  },
};

// Curated routine: the Type tile reads "Curated" and the schedule renders one
// row per date from today through the end date (date-keyed, not by weekday).
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
  play: smokePlay([
    {
      text: "Curated",
    },
    {
      text: "Curated Schedule",
    },
    {
      text: "Course 1",
    },
  ]),
};
