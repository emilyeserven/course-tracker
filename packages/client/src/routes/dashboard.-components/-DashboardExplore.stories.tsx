import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DashboardExplore } from "./-DashboardExplore";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

function seededClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(queryKeys.domains.explore(), {
    rings: ["Trial"],
    items: [
      {
        topicId: "topic-1",
        topicName: "React Hooks",
        domainId: "domain-1",
        domainTitle: "Frontend Engineering",
        ringName: "Trial",
        description: "Worth a look.",
      },
    ],
  });
  client.setQueryData(queryKeys.settings.detail(), makeAppSettings());
  client.setQueryData(queryKeys.domains.list(), []);
  return client;
}

const meta: Meta<typeof DashboardExplore> = {
  component: DashboardExplore,
  args: {
    tile: makeTile("exploreSomething"),
    onUpdateTile: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={seededClient()}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
  // The selected ring is persisted in localStorage; reset it so the fixture's
  // "Trial" ring is the one shown.
  beforeEach: () => {
    window.localStorage.clear();
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The "All Domains" tab lists topics in the current (Trial) ring.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Explore Something"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", {
        name: /all domains/i,
      }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText("React Hooks")).toBeInTheDocument();
  },
};
