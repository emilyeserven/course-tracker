import type { RoutineReferenceItem, RoutineWeekly } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyTitle } from "./DailyTitle";

import { makeDaily } from "@/test-utils/dailiesFixtures";

// Populate every weekday key so the "today" entry resolves regardless of which
// day the story runs on (DailyTitle reads new Date().getDay()).
const everyDayEntry: RoutineReferenceItem = {
  type: "task",
  id: "ref-1",
  notes: "Focus on the subjunctive",
};
const weeklyGrid: RoutineWeekly = {
  0: everyDayEntry,
  1: everyDayEntry,
  2: everyDayEntry,
  3: everyDayEntry,
  4: everyDayEntry,
  5: everyDayEntry,
  6: everyDayEntry,
};

const meta = {
  component: DailyTitle,
} satisfies Meta<typeof DailyTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DailyMode: Story = {
  args: {
    daily: makeDaily({
      actionParts: {
        prependText: "Learn",
        name: "Spanish",
        appendText: "daily",
      },
      description: "Build fluency",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Spanish")).toBeInTheDocument();
    await expect(canvas.getByText("Learn")).toBeInTheDocument();
    await expect(canvas.getByText("Build fluency")).toBeInTheDocument();
  },
};

export const WeeklyMode: Story = {
  args: {
    daily: makeDaily({
      mode: "weekly",
      weekly: weeklyGrid,
      actionParts: {
        name: "Piano practice",
      },
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Piano practice")).toBeInTheDocument();
    await expect(
      canvas.getByText("Focus on the subjunctive"),
    ).toBeInTheDocument();
  },
};
