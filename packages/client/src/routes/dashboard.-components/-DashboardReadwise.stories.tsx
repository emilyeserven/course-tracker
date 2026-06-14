import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardReadwise } from "./-DashboardReadwise";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { queryKeys } from "@/utils/queryKeys";

function clientWith(configured: boolean) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(queryKeys.readwise.readingList(), {
    configured,
    started: [],
    unstarted: [],
  });
  return client;
}

const meta: Meta<typeof DashboardReadwise> = {
  component: DashboardReadwise,
  args: {
    tile: makeTile("readwise"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={clientWith(false)}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Not connected: the card prompts the user to add an API key.
export const ConnectPrompt: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/add your readwise api key/i),
    ).toBeInTheDocument();
  },
};

// Connected but with no articles yet shows the empty in-progress state.
export const ConfiguredEmpty: Story = {
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={clientWith(true)}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/no articles in progress/i),
    ).toBeInTheDocument();
  },
};
