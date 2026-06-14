import type { Meta, StoryObj } from "@storybook/react-vite";

import { TopicBox } from "./TopicBox";

import { makeTopicRow } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof TopicBox> = {
  component: TopicBox,
  args: makeTopicRow(),
  decorators: [cardStoryDecorator({
    constrained: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

// "Frontend" is the domain tag rendered via DomainTagList.
export const Default: Story = {
  play: smokeText("TypeScript", "Frontend"),
};
