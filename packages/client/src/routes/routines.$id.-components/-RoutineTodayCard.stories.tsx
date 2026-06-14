import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { RoutineTodayCard } from "./-RoutineTodayCard";

import { SettingsProvider } from "@/context/SettingsProvider";
import { makeRoutine, makeResources, makeTask } from "@/test-utils/boxFixtures";
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
  client.setQueryData(["tasks"], [makeTask()]);
  client.setQueryData(["resources"], makeResources());
  return client;
}

const meta = {
  component: RoutineTodayCard,
  args: {
    data: makeRoutine(),
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
} satisfies Meta<typeof RoutineTodayCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Daily routine: today's entry plus the today-status control.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Today's Task")).toBeInTheDocument();
  },
};

// A routine with nothing scheduled today shows the rest-day copy.
export const NothingToday: Story = {
  args: {
    data: makeRoutine({
      mode: "weekly",
      weekly: {},
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/nothing, take a break/i),
    ).toBeInTheDocument();
  },
};
