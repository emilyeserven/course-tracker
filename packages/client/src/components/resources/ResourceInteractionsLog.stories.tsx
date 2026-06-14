import type { Interaction } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { ResourceInteractionsLog } from "./ResourceInteractionsLog";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeInteraction } from "@/test-utils/resourceModulesFixtures";
import { queryKeys } from "@/utils/queryKeys";

const RESOURCE_ID = "resource-1";

// Build a QueryClient seeded with the data `useInteractionsLog` reads via
// useQuery, so the log renders its loaded state without a network call.
// staleTime Infinity stops a background (networkless) refetch from clobbering
// the seeded entries in the story environment.
function seededClient(interactions: Interaction[]): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(
    queryKeys.resources.interactions(RESOURCE_ID),
    interactions,
  );
  client.setQueryData(queryKeys.resources.moduleGroups(RESOURCE_ID), []);
  client.setQueryData(queryKeys.resources.modules(RESOURCE_ID), []);
  return client;
}

const meta = {
  component: ResourceInteractionsLog,
  args: {
    resourceId: RESOURCE_ID,
  },
} satisfies Meta<typeof ResourceInteractionsLog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    Story => (
      <QueryStub client={seededClient([])}>
        <div className="max-w-xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("No interactions logged yet."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "Log Interaction",
      }),
    ).toBeInTheDocument();
  },
};

export const WithInteractions: Story = {
  decorators: [
    Story => (
      <QueryStub
        client={seededClient([
          makeInteraction({
            id: "i1",
            date: "2026-06-12",
            progress: "started",
            note: "Read chapter 1.",
          }),
          makeInteraction({
            id: "i2",
            date: "2026-06-10",
            progress: "complete",
            note: "Finished the intro.",
          }),
        ])}
      >
        <div className="max-w-xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Read chapter 1.")).toBeInTheDocument();
    await expect(canvas.getByText("Finished the intro.")).toBeInTheDocument();
  },
};
