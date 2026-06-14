import type { Interaction } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ResourceInteractionsLog } from "./ResourceInteractionsLog";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeInteraction } from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryKeys } from "@/utils/queryKeys";

const RESOURCE_ID = "resource-1";

// Build a QueryClient seeded with the data `useInteractionsLog` reads via
// useQuery, so the log renders its loaded state without a network call.
function seededClient(interactions: Interaction[]) {
  return seededQueryClient([
    [queryKeys.resources.interactions(RESOURCE_ID), interactions],
    [queryKeys.resources.moduleGroups(RESOURCE_ID), []],
    [queryKeys.resources.modules(RESOURCE_ID), []],
  ]);
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
