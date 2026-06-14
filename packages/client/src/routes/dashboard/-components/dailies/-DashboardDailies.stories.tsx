import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DashboardDoneForDay, DashboardDoNow } from "./-DashboardDailies";

import { makeDaily } from "@/test-utils/dailiesFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

function seededClient() {
  return seededQueryClient([
    [
      ["dailies"],
      [
        makeDaily({
          status: "active",
        }),
      ],
    ],
  ]);
}

const meta: Meta<typeof DashboardDoNow> = {
  component: DashboardDoNow,
  args: {
    tile: makeTile("doNow"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={seededClient()}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// The "Do Now" card with its view-mode toggle and "View all" link.
export const DoNow: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Do Now")).toBeInTheDocument();
  },
};

// The companion "Done for the Day" card.
export const DoneForDay: Story = {
  render: args => <DashboardDoneForDay {...args} />,
  args: {
    tile: makeTile("doneForDay"),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Done for the Day"),
    ).toBeInTheDocument();
  },
};
