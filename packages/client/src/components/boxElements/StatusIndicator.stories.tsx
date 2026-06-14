import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusIndicator } from "./StatusIndicator";

import { TooltipProvider } from "@/components/ui/tooltip";

const meta: Meta<typeof StatusIndicator> = {
  component: StatusIndicator,
  args: {
    status: "active",
  },
  decorators: [
    Story => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = {
  args: {
    status: "inactive",
  },
};

export const Complete: Story = {
  args: {
    status: "complete",
  },
};
