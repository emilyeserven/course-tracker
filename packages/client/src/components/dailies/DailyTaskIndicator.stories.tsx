import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyTaskIndicator } from "./DailyTaskIndicator";

import { makeDaily, makeTask } from "@/test-utils/dailiesFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta = {
  component: DailyTaskIndicator,
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof DailyTaskIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTask: Story = {
  args: {
    daily: makeDaily({
      task: makeTask({
        name: "Build the widget",
      }),
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByRole("link", {
      name: /go to task build the widget/i,
    });
    await expect(link).toBeInTheDocument();
  },
};
