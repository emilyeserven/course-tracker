import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DailyTrackerRow } from "./DailyTrackerRow";

import {
  makeDaily,
  makeRecentCompletions,
  makeResource,
} from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { getTodayKey } from "@/utils";

const meta: Meta<typeof DailyTrackerRow> = {
  component: DailyTrackerRow,
  args: {
    daily: makeDaily({
      name: "Spanish practice",
      resource: makeResource({
        name: "Duolingo Spanish",
      }),
      taskId: "task-1",
      completions: makeRecentCompletions([
        "goal",
        "touched",
        "goal",
        "goal",
        "exceeded",
      ]),
    }),
    todayKey: getTodayKey(),
    recentDaysCount: 5,
    mutationPending: false,
    onChangeStatus: fn(),
    rowClassName: "align-middle",
    statusCellClassName: "w-36 p-2",
    firstConnectorClassName: "w-auto",
    taskId: "task-1",
  },
  // The row is a bare <tr>; mount it inside a table so the markup is valid.
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <table>
            <tbody>
              <Story />
            </tbody>
          </table>
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const InTable: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Spanish practice"),
    ).toBeInTheDocument();
  },
};
