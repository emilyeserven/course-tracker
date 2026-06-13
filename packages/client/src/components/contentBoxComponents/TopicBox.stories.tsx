import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TopicBox } from "./TopicBox";

import { makeTopicRow } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof TopicBox> = {
  component: TopicBox,
  args: makeTopicRow(),
  decorators: [
    Story => (
      <RouterStub>
        <div className="max-w-sm">
          <Story />
        </div>
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
    await expect(await canvas.findByText("TypeScript")).toBeInTheDocument();
    // Domain tag rendered via DomainTagList.
    await expect(await canvas.findByText("Frontend")).toBeInTheDocument();
  },
};
