import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "@storybook/test";

import { RadarBlipDot } from "./RadarBlipDot";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeBlip } from "@/test-utils/radarFixtures";

const meta: Meta<typeof RadarBlipDot> = {
  component: RadarBlipDot,
  args: {
    blip: makeBlip({
      id: "blip-0",
      topicName: "Kubernetes",
      description: "Container orchestration",
    }),
    x: 100,
    y: 80,
    index: 1,
    color: "#2563eb",
    dotRadius: 12,
    haloRadius: 20,
    fontSize: 12,
    subtitle: "Tools · Adopt",
    isActive: false,
    isSelected: false,
    onHover: fn(),
    onClick: fn(),
  },
  decorators: [
    Story => (
      <TooltipProvider>
        <svg
          width={200}
          height={160}
        >
          <Story />
        </svg>
      </TooltipProvider>
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
    await expect(canvas.getByText("1")).toBeInTheDocument();
  },
};

export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};
