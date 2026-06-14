import type { Topic } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { TopicForm } from "./-TopicForm";

import { makeDomain, makeResources } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const TOPIC_ID = "topic-1";

const topicDetail: Topic = {
  id: TOPIC_ID,
  name: "TypeScript",
  description: "Static typing for JavaScript.",
  reason: "Career growth.",
  domains: [
    {
      id: "domain-1",
      title: "Frontend Engineering",
    },
  ],
  tags: [],
  resourceLinks: [],
};

// Seeds the option lists every variant needs; `seedDetail` adds the topic detail
// for the edit form (the create form leaves it out — its query is disabled).
function buildClient(seedDetail: boolean) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  if (seedDetail) {
    client.setQueryData(["topic", TOPIC_ID], topicDetail);
  }
  client.setQueryData(["domains"], [makeDomain()]);
  client.setQueryData(["tagGroups"], []);
  client.setQueryData(["resources"], makeResources());
  client.setQueryData(["module-groups-all"], []);
  client.setQueryData(["modules-all"], []);
  return client;
}

const meta = {
  component: TopicForm,
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof TopicForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// Edit an existing topic: fields hydrate from the seeded detail.
export const Edit: Story = {
  args: {
    id: TOPIC_ID,
    isNew: false,
  },
  decorators: [
    Story => (
      <QueryStub client={buildClient(true)}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: /edit topic/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByDisplayValue("TypeScript")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save changes/i,
      }),
    ).toBeInTheDocument();
  },
};

// Create a new topic: empty form, no detail fetch.
export const New: Story = {
  args: {
    id: "new",
    isNew: true,
  },
  decorators: [
    Story => (
      <QueryStub client={buildClient(false)}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: /new topic/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Topic Name")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /create topic/i,
      }),
    ).toBeInTheDocument();
  },
};
