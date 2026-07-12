import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DailiesActiveListView } from "./DailiesActiveListView";

import {
  makeDaily,
  makeRecentCompletions,
  makeTask,
} from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { getTodayKey } from "@/utils";

const dailies = [
  makeDaily({
    id: "d1",
    name: "Spanish practice",
    location: "https://duolingo.com",
    task: makeTask({
      name: "Duolingo Spanish",
    }),
    completions: makeRecentCompletions(["goal", "touched", "goal", "goal"]),
  }),
  makeDaily({
    id: "d2",
    name: "Ship the widget",
    location: "Workshop",
    task: makeTask({
      name: "Widget milestone",
    }),
    taskId: "task-1",
    completions: makeRecentCompletions(["touched", null, "goal"]),
  }),
];

const meta: Meta<typeof DailiesActiveListView> = {
  component: DailiesActiveListView,
  args: {
    dailies,
    todayKey: getTodayKey(),
    mutationPending: false,
    onChangeStatus: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoActiveDailies: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Spanish practice"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Ship the widget")).toBeInTheDocument();
  },
};
