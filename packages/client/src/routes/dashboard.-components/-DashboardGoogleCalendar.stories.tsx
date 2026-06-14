import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardGoogleCalendar } from "./-DashboardGoogleCalendar";

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
  client.setQueryData(queryKeys.googleCalendar.events(), {
    configured,
    events: [],
  });
  return client;
}

const meta: Meta<typeof DashboardGoogleCalendar> = {
  component: DashboardGoogleCalendar,
  args: {
    tile: makeTile("googleCalendar"),
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

// No feed subscribed: the card prompts the user to add one.
export const ConnectPrompt: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/add a calendar feed/i),
    ).toBeInTheDocument();
  },
};

// Connected with no upcoming events shows the empty state.
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
      await canvas.findByText(/no upcoming events/i),
    ).toBeInTheDocument();
  },
};
