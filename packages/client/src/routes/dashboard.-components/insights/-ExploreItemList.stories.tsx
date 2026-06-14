import type { ExploreItem } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExploreItemList } from "./-ExploreItemList";

import { RouterStub } from "@/test-utils/RouterStub";

const items: ExploreItem[] = [
  {
    topicId: "t1",
    topicName: "Spaced repetition",
    domainId: "d1",
    domainTitle: "Learning Science",
    ringName: "Adopt",
    description: "Schedule reviews at expanding intervals to fight forgetting.",
  },
  {
    topicId: "t2",
    topicName: "Interleaving",
    domainId: "d1",
    domainTitle: "Learning Science",
    ringName: "Trial",
    description: null,
  },
];

const meta: Meta<typeof ExploreItemList> = {
  component: ExploreItemList,
  args: {
    items,
    showDomain: true,
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

export const WithDomain: Story = {};

export const WithoutDomain: Story = {
  args: {
    showDomain: false,
  },
};
