import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyTaskIndicator } from "./DailyTaskIndicator";

import { makeDaily, makeTask } from "@/test-utils/dailiesFixtures";
import { routerStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta = {
  component: DailyTaskIndicator,
  decorators: [routerStoryDecorator()],
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
  play: smokePlay([{
    role: "link",
    name: /go to task build the widget/i,
  }]),
};
