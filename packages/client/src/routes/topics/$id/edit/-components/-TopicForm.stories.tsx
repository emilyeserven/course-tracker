import type { Topic } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { QueryKey } from "@tanstack/react-query";

import { TopicForm } from "./-TopicForm";

import { makeResources } from "@/test-utils/boxFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import {
  queryStubDecorator,
  routerDecorator,
} from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const TOPIC_ID = "topic-1";

const topicDetail: Topic = {
  id: TOPIC_ID,
  name: "TypeScript",
  description: "Static typing for JavaScript.",
  reason: "Career growth.",
  tags: [],
  resourceLinks: [],
};

// Seeds the option lists every variant needs; `seedDetail` adds the topic detail
// for the edit form (the create form leaves it out — its query is disabled).
function buildClient(seedDetail: boolean) {
  const entries: [QueryKey, unknown][] = [
    [["tagGroups"], []],
    [["resources"], makeResources()],
    [["module-groups-all"], []],
    [["modules-all"], []],
  ];
  if (seedDetail) {
    entries.unshift([["topic", TOPIC_ID], topicDetail]);
  }
  return seededQueryClient(entries);
}

const meta = {
  component: TopicForm,
  decorators: [routerDecorator],
} satisfies Meta<typeof TopicForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// Edit an existing topic: fields hydrate from the seeded detail.
export const Edit: Story = {
  args: {
    id: TOPIC_ID,
    isNew: false,
  },
  decorators: [queryStubDecorator(() => buildClient(true))],
  play: smokePlay([
    {
      role: "heading",
      name: /edit topic/i,
    },
    {
      displayValue: "TypeScript",
    },
    {
      role: "button",
      name: /save changes/i,
    },
  ]),
};

// Create a new topic: empty form, no detail fetch.
export const New: Story = {
  args: {
    id: "new",
    isNew: true,
  },
  decorators: [queryStubDecorator(() => buildClient(false))],
  play: smokePlay([
    {
      role: "heading",
      name: /new topic/i,
    },
    {
      text: "Topic Name",
    },
    {
      role: "button",
      name: /create topic/i,
    },
  ]),
};
