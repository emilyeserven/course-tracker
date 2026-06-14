import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardTodoist } from "./-DashboardTodoist";

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
  client.setQueryData(queryKeys.todoist.tasks(), {
    configured,
    overdue: [],
    today: [],
  });
  return client;
}

const meta: Meta<typeof DashboardTodoist> = {
  component: DashboardTodoist,
  args: {
    tile: makeTile("todoist"),
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
      await canvas.findByText(/add your todoist api key/i),
    ).toBeInTheDocument();
  },
};

// Connected with nothing due shows the celebratory empty state.
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
      await canvas.findByText(/nothing due today/i),
    ).toBeInTheDocument();
  },
};
