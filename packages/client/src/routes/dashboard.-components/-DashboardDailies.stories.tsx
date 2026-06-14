import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardDoneForDay, DashboardDoNow } from "./-DashboardDailies";

import { SettingsProvider } from "@/context/SettingsProvider";
import { makeDaily } from "@/test-utils/dailiesFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

function seededClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["dailies"], [
    makeDaily({
      status: "active",
    }),
  ]);
  return client;
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
        <SettingsProvider>
          <QueryStub client={seededClient()}>
            <Story />
          </QueryStub>
        </SettingsProvider>
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
