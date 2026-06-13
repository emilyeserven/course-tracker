import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TaskBox } from "./TaskBox";

import { makeTask } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof TaskBox> = {
  component: TaskBox,
  args: makeTask(),
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
    await expect(
      await canvas.findByText("Finish the tutorial project"),
    ).toBeInTheDocument();
    await expect(await canvas.findByText("TypeScript")).toBeInTheDocument();
  },
};

export const NoTopic: Story = {
  args: makeTask({
    topic: null,
  }),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("No topic")).toBeInTheDocument();
  },
};
