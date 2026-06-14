import type { DomainTopic } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TopicLinkList } from "./-TopicLinkList";

import { RouterStub } from "@/test-utils/RouterStub";

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
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Reactivity")).toBeInTheDocument();
    // A multi-course topic pluralizes the count; a single-course one does not.
    await expect(canvas.getByText("(2 courses)")).toBeInTheDocument();
    await expect(canvas.getByText("(1 course)")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    topics: [],
  },
};
