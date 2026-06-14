import type { Meta, StoryObj } from "@storybook/react-vite";

import { TaskBox } from "./TaskBox";

import { makeTask } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof TaskBox> = {
  component: TaskBox,
  args: makeTask(),
  decorators: [cardStoryDecorator({
    constrained: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Finish the tutorial project", "TypeScript"),
};

export const NoTopic: Story = {
  args: makeTask({
    topic: null,
  }),
  play: smokeText("No topic"),
};
