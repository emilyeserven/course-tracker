import type { Meta, StoryObj } from "@storybook/react-vite";

import { within, expect } from "@storybook/test";

import { TopicList } from "./TopicList";

import { RouterStub } from "@/test-utils/RouterStub";

const topics = [
  {
    id: "1",
    name: "React",
  },
  {
    id: "2",
    name: "Vue",
  },
];

const meta: Meta<typeof TopicList> = {
  component: TopicList,
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

export const Pills: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "React",
      }),
    ).toBeInTheDocument();
  },
};

export const Inline: Story = {
  args: {
    isPills: false,
  },
};
