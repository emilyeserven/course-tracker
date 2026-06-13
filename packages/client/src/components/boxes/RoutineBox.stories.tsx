import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineBox } from "./RoutineBox";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeRoutine } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof RoutineBox> = {
  component: RoutineBox,
  args: makeRoutine(),
  decorators: [
    Story => (
      <RouterStub>
        <TooltipProvider>
          <div className="max-w-sm">
            <Story />
          </div>
        </TooltipProvider>
      </RouterStub>
    ),
  ],
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

export const DailyNoTask: Story = {
  args: makeRoutine({
    name: "Stretch",
    connections: [],
    weekly: {},
  }),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The "no task assigned" caution surfaces an accessible label.
    await expect(
      await canvas.findByLabelText("No task assigned"),
    ).toBeInTheDocument();
  },
};
