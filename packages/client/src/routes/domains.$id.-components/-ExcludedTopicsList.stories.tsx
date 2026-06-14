import type { DomainExcludedTopic } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExcludedTopicsList } from "./-ExcludedTopicsList";

import { routerDecorator } from "@/test-utils/storyDecorators";

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
