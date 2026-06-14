import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyCompletionsManager } from "./DailyCompletionsManager";

import { makeDaily, makeRecentCompletions } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";

const meta: Meta<typeof DailyCompletionsManager> = {
  component: DailyCompletionsManager,
  args: {
    daily: makeDaily({
      name: "Daily drills",
      mode: "daily",
      completions: makeRecentCompletions([
        "goal",
        "touched",
        null,
        "goal",
        "exceeded",
        "freeze",
        "goal",
      ]),
    }),
  },
  decorators: [
    Story => (
      <QueryStub>
        <Story />
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Render-only: a heavy month-calendar container. Mounting is the smoke test.
export const Editable: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};
