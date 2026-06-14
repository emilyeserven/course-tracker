import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineLinkList } from "./-RoutineLinkList";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof RoutineLinkList> = {
  component: RoutineLinkList,
  args: {
    routines: [
      makeRoutine({
        id: "routine-1",
        name: "Daily reading",
      }),
      makeRoutine({
        id: "routine-2",
        name: "Flashcards",
      }),
    ],
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

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "Daily reading",
      }),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    routines: [],
  },
};
