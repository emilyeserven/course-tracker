import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { LinkedRoutinesSection } from "./-LinkedRoutinesSection";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof LinkedRoutinesSection> = {
  component: LinkedRoutinesSection,
  args: {
    taskId: "task-1",
    routines: [
      makeRoutine({
        id: "routine-1",
        name: "Morning practice",
        mode: "daily",
      }),
      makeRoutine({
        id: "routine-2",
        name: "Weekly review",
        mode: "weekly",
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
      await canvas.findByText("Morning practice"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Daily")).toBeInTheDocument();
    await expect(canvas.getByText("Weekly")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    routines: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("No routines include this task."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /Create Routine for this Task/,
      }),
    ).toBeInTheDocument();
  },
};
