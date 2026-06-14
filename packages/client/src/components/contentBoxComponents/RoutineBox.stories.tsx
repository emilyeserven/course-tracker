import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineBox } from "./RoutineBox";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof RoutineBox> = {
  component: RoutineBox,
  args: makeRoutine(),
  decorators: [cardStoryDecorator({
    tooltip: true,
    constrained: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Daily: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Daily reading")).toBeInTheDocument();
    await expect(await canvas.findByText("Daily")).toBeInTheDocument();
    await expect(await canvas.findByText("chain")).toBeInTheDocument();
  },
};

export const Weekly: Story = {
  args: makeRoutine({
    name: "Weekly review",
    mode: "weekly",
    todayAction: {
      name: "Review the backlog",
      prependText: "Time to",
      appendText: "for today",
    },
  }),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Weekly")).toBeInTheDocument();
    await expect(
      await canvas.findByText("Review the backlog"),
    ).toBeInTheDocument();
  },
};
