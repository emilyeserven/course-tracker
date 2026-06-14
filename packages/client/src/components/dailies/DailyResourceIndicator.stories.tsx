import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailyResourceIndicator } from "./DailyResourceIndicator";

import { makeDaily, makeResource } from "@/test-utils/dailiesFixtures";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta = {
  component: DailyResourceIndicator,
  decorators: [queryStoryDecorator()],
} satisfies Meta<typeof DailyResourceIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithResource: Story = {
  args: {
    daily: makeDaily({
      resource: makeResource({
        name: "Duolingo Spanish",
      }),
    }),
  },
  // The resource link is always visible; the increment button next to it is
  // visibility:hidden until hover, so we only assert the link here (the story
  // still smoke-renders the whole component).
  play: smokePlay([{
    role: "link",
    name: /go to course duolingo spanish/i,
  }]),
};
