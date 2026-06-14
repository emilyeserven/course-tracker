import type { TagGroup } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { TagGroupsAdmin } from "./TagGroupsAdmin";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeTagGroups } from "@/test-utils/resourceModulesFixtures";

// Reads tag groups via useQuery(["tagGroups"]); seed a client so it renders
// without a network call. Mutations are never fired, so they stay inert.
function seededClient(groups: TagGroup[]): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["tagGroups"], groups);
  return client;
}

const meta = {
  component: TagGroupsAdmin,
} satisfies Meta<typeof TagGroupsAdmin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithGroups: Story = {
  decorators: [
    Story => (
      <QueryStub client={seededClient(makeTagGroups(2))}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Tag Groups")).toBeInTheDocument();
    await expect(canvas.getByText("Tag Group 1")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  decorators: [
    Story => (
      <QueryStub client={seededClient([])}>
        <div className="max-w-2xl">
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
      await canvas.findByText(/No tag groups yet/),
    ).toBeInTheDocument();
  },
};
