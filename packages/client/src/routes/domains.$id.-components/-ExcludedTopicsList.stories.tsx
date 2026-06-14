import type { DomainExcludedTopic } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ExcludedTopicsList } from "./-ExcludedTopicsList";

import { RouterStub } from "@/test-utils/RouterStub";

const topics: DomainExcludedTopic[] = [
  {
    id: "topic-1",
    name: "Legacy Mixins",
    reason: "Superseded by hooks",
  },
  {
    id: "topic-2",
    name: "Class Components",
  },
];

const meta: Meta<typeof ExcludedTopicsList> = {
  component: ExcludedTopicsList,
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
    await expect(await canvas.findByText("Legacy Mixins")).toBeInTheDocument();
    // The optional reason renders alongside the topic that has one.
    await expect(canvas.getByText(/Superseded by hooks/)).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    topics: [],
  },
};
