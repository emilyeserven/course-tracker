import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { ResourcesTable } from "./ResourcesTable";

import { makeTask } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { makeTaskResource } from "@/test-utils/tasksFixtures";
import { queryKeys } from "@/utils/queryKeys";

// Seed the linkable-resource queries the table's hook reads so the stories
// render without hitting the network (staleTime keeps them from refetching).
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
});
client.setQueryData(queryKeys.resources.list(), []);
client.setQueryData(["module-groups-all"], []);
client.setQueryData(["modules-all"], []);

const meta = {
  component: ResourcesTable,
  args: {
    task: makeTask({
      resources: [
        makeTaskResource({
          id: "tr-1",
          name: "Reference docs",
          resourceId: null,
        }),
        makeTaskResource({
          id: "tr-2",
          name: "Intro to TypeScript",
          resourceId: "resource-1",
          resource: {
            id: "resource-1",
            name: "Intro to TypeScript",
          },
        }),
      ],
    }),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={client}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof ResourcesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Resources render as table rows with the search and used filters above. */
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Reference docs")).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText("Search by name or location"),
    ).toBeInTheDocument();
  },
};

/** With no resources the empty state offers a single Add Resource action. */
export const Empty: Story = {
  args: {
    task: makeTask({
      resources: [],
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("No resources yet.")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "Add Resource",
      }),
    ).toBeInTheDocument();
  },
};
