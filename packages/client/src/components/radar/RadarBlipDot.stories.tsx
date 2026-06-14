import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RadarBlipDot } from "./RadarBlipDot";

import { makeBlip } from "@/test-utils/radarFixtures";
import { svgStoryDecorator } from "@/test-utils/storyDecorators";

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
  decorators: [svgStoryDecorator({
    width: 200,
    height: 160,
    tooltip: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
