import type { DomainTopic } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { TopicLinkList } from "./-TopicLinkList";

import { routerDecorator } from "@/test-utils/storyDecorators";

const topics: DomainTopic[] = [
  {
    id: "topic-1",
    name: "Reactivity",
    courses: [
      {
        id: "c1",
        name: "Course A",
      },
      {
        id: "c2",
        name: "Course B",
      },
    ],
  },
  {
    id: "topic-2",
    name: "Routing",
    courses: [
      {
        id: "c3",
        name: "Course C",
      },
    ],
  },
  {
    id: "topic-3",
    name: "Suspense",
  },
];

const meta: Meta<typeof TopicLinkList> = {
  component: TopicLinkList,
  args: {
    topics,
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    topics: [],
  },
};
