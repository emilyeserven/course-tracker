import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyResourceIndicator } from "./DailyResourceIndicator";

import { makeDaily, makeResource } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const meta = {
  component: DailyResourceIndicator,
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The resource link is always visible; the increment button next to it is
    // visibility:hidden until hover, so we only assert the link here (the story
    // still smoke-renders the whole component).
    const link = await canvas.findByRole("link", {
      name: /go to course duolingo spanish/i,
    });
    await expect(link).toBeInTheDocument();
  },
};
