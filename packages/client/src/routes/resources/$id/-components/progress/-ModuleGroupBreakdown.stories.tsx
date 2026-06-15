import type { GroupProgress } from "@/utils/moduleProgress";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { ModuleGroupBreakdown } from "./-ModuleGroupBreakdown";

import { smokePlay } from "@/test-utils/storyPlay";

const groups: GroupProgress[] = [
  {
    id: "g1",
    name: "Getting Started",
    moduleCount: 5,
    completedCount: 5,
    percentComplete: 100,
    isComplete: true,
  },
  {
    id: "g2",
    name: "Core Concepts",
    moduleCount: 8,
    completedCount: 3,
    percentComplete: 38,
    isComplete: false,
  },
  {
    id: "g3",
    name: "Appendix",
    moduleCount: 4,
    completedCount: 0,
    percentComplete: 0,
    isComplete: false,
  },
];

const meta: Meta<typeof ModuleGroupBreakdown> = {
  component: ModuleGroupBreakdown,
  args: {
    groups,
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

// Starts collapsed: only the toggle is visible, no table yet.
export const Collapsed: Story = {
  play: smokePlay([{
    role: "button",
    name: "Group breakdown",
  }]),
};

// Clicking the toggle reveals the per-group table.
export const Expanded: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Group breakdown",
      }),
    );
    await expect(canvas.getByRole("table")).toBeInTheDocument();
    await expect(canvas.getByText("Core Concepts")).toBeInTheDocument();
    await expect(canvas.getByText("38%")).toBeInTheDocument();
  },
};
