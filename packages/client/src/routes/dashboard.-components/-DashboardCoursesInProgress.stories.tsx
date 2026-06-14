import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardCoursesInProgress } from "./-DashboardCoursesInProgress";

import { makeResources } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

function clientWith(resources: unknown) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["resources"], resources);
  client.setQueryData(["dailies"], []);
  return client;
}

const meta: Meta<typeof DashboardCoursesInProgress> = {
  component: DashboardCoursesInProgress,
  args: {
    tile: makeTile("coursesInProgress"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={clientWith(makeResources())}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Active courses without an active daily are listed as links.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Resources in Progress"),
    ).toBeInTheDocument();
    await expect(await canvas.findByText("Course 1")).toBeInTheDocument();
  },
};

// No active courses shows the empty message.
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
      await canvas.findByText(/no courses in progress/i),
    ).toBeInTheDocument();
  },
};
