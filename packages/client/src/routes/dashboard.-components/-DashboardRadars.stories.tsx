import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardRadars } from "./-DashboardRadars";

import { makeDomain } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

function clientWith(domains: unknown) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["domains"], domains);
  return client;
}

const meta: Meta<typeof DashboardRadars> = {
  component: DashboardRadars,
  args: {
    tile: makeTile("radars"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={clientWith([makeDomain()])}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Lists the domains as radar links.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Frontend Engineering"),
    ).toBeInTheDocument();
  },
};

// No domains yet shows the empty message.
export const Empty: Story = {
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={clientWith([])}>
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
      await canvas.findByText(/no radars yet/i),
    ).toBeInTheDocument();
  },
};
