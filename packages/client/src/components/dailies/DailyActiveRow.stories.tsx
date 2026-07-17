import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DailyActiveRow } from "./DailyActiveRow";

import {
  makeDaily,
  makeRecentCompletions,
  makeTask,
} from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { smokeText } from "@/test-utils/storyPlay";
import { getTodayKey } from "@/utils";

const meta: Meta<typeof DailyActiveRow> = {
  component: DailyActiveRow,
  args: {
    daily: makeDaily({
      id: "d1",
      name: "Spanish practice",
      location: "https://duolingo.com",
      task: makeTask({
        name: "Duolingo Spanish",
      }),
      completions: makeRecentCompletions(["goal", "touched", "goal", "goal"]),
    }),
    todayKey: getTodayKey(),
    mutationPending: false,
    recentDaysCount: 6,
    onChangeStatus: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <ul className="max-w-xl">
            <Story />
          </ul>
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHistory: Story = {
  play: smokeText("Spanish practice"),
};

export const NoCompletions: Story = {
  args: {
    daily: makeDaily({
      id: "d2",
      name: "Morning stretch",
      completions: [],
    }),
  },
  play: smokeText("Morning stretch"),
};
