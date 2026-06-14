import type { TagGroup } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { TagGroupsAdmin } from "./-TagGroupsAdmin";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeTagGroups } from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

// Reads tag groups via useQuery(["tagGroups"]); seed a client so it renders
// without a network call. Mutations are never fired, so they stay inert.
function seededClient(groups: TagGroup[]) {
  return seededQueryClient([[["tagGroups"], groups]]);
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
};
