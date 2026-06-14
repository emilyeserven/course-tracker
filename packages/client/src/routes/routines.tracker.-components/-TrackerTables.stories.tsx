import type { RoutineTrackerState } from "@/hooks/useRoutineTracker";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { TrackerTables } from "./-TrackerTables";

import { SettingsProvider } from "@/context/SettingsProvider";
import { makeDaily, makeRecentCompletions } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { getTodayKey } from "@/utils";

// Builds the bundle the tables consume. The tracker hook is bypassed: we supply
// the buckets directly and stub the mutation/handlers (the body only reads them,
// and stories never fire the real status mutation).
function makeTrackerState(
  overrides: Partial<RoutineTrackerState> = {},
): RoutineTrackerState {
  return {
    maxActiveDailies: 5,
    mode: "list",
    setMode: fn(),
    sorting: [],
    onSortingChange: fn(),
    mutation: {
      isPending: false,
      mutate: fn(),
    },
    baseSorted: [],
    activeDailies: [],
    pausedDailies: [],
    completedDailies: [],
    dayHeaders: [],
    todayKey: getTodayKey(),
    recentDaysCount: 6,
    ...overrides,
  } as unknown as RoutineTrackerState;
}

const activeDaily = makeDaily({
  id: "daily-active",
  name: "Morning reading",
  status: "active",
  completions: makeRecentCompletions(["goal", "touched", "goal"]),
});
const pausedDaily = makeDaily({
  id: "daily-paused",
  name: "Evening review",
  status: "paused",
});
const completedDaily = makeDaily({
  id: "daily-complete",
  name: "Finished course",
  status: "complete",
});

const meta: Meta<typeof TrackerTables> = {
  component: TrackerTables,
  decorators: [
    Story => (
      <RouterStub>
        <SettingsProvider>
          <QueryStub>
            <Story />
          </QueryStub>
        </SettingsProvider>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// All three sections populated (Active list view, Paused, Completed).
export const Default: Story = {
  args: makeTrackerState({
    baseSorted: [activeDaily, pausedDaily, completedDaily],
    activeDailies: [activeDaily],
    pausedDailies: [pausedDaily],
    completedDailies: [completedDaily],
  }),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Active Routines"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Paused Routines")).toBeInTheDocument();
    await expect(canvas.getByText("Completed Routines")).toBeInTheDocument();
  },
};

// No routines at all shows the empty-state copy.
export const Empty: Story = {
  args: makeTrackerState(),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/no routines yet/i),
    ).toBeInTheDocument();
  },
};
