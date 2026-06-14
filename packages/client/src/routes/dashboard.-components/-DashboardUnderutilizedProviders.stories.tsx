import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DashboardUnderutilizedProviders } from "./-DashboardUnderutilizedProviders";

import { makeProvider } from "@/test-utils/boxFixtures";
import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

function clientWith(providers: unknown) {
  return seededQueryClient([[["providers"], providers]]);
}

const meta: Meta<typeof DashboardUnderutilizedProviders> = {
  component: DashboardUnderutilizedProviders,
  args: {
    tile: makeTile("underutilizedProviders"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub
          client={clientWith([
            makeProvider({
              completeCount: 2,
            }),
          ])}
        >
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// A paid provider with no active courses shows in the underutilized table.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Acme Learning")).toBeInTheDocument();
  },
};

// No qualifying providers shows the empty message.
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
      await canvas.findByText(/no underutilized providers/i),
    ).toBeInTheDocument();
  },
};
