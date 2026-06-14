import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { EntriesTab } from "./-EntriesTab";

import { makeDaily, makeRecentCompletions } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

const DAILY_ID = "daily-1";

// Seeds the daily projection the tab reads so the completions manager renders
// instead of the pending/error placeholder.
function seededClient() {
  return seededQueryClient([
    [
      ["daily", DAILY_ID],
      makeDaily({
        completions: makeRecentCompletions(["goal", "touched", "goal"]),
      }),
    ],
  ]);
}

const meta = {
  component: EntriesTab,
  args: {
    id: DAILY_ID,
  },
  decorators: [
    Story => (
      <QueryStub client={seededClient()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof EntriesTab>;

export default meta;

type Story = StoryObj<typeof meta>;

// The self-saving completions manager (reused from the routine View page).
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Logged entries")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /next month/i,
      }),
    ).toBeInTheDocument();
  },
};
