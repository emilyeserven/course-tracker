import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { LevelTriad } from "./LevelTriad";

const meta: Meta<typeof LevelTriad> = {
  component: LevelTriad,
  args: {
    easeOfStarting: "",
    timeNeeded: "",
    interactivity: "",
    onChange: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Ease of Starting")).toBeInTheDocument();
    await expect(canvas.getByText("Time Needed")).toBeInTheDocument();
    await expect(canvas.getByText("Interactivity")).toBeInTheDocument();
  },
};

export const AllSet: Story = {
  args: {
    easeOfStarting: "low",
    timeNeeded: "medium",
    interactivity: "high",
  },
};
