import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { RadarChart } from "./RadarChart";

import { makeBlips, makeQuadrants, makeRings } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof RadarChart> = {
  component: RadarChart,
  args: {
    quadrants: makeQuadrants(),
    rings: makeRings(),
    blips: makeBlips(8),
    size: 500,
    showLegend: true,
    onBlipClick: fn(),
    onDescriptionChange: fn(),
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

export const WithLegend: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Kubernetes")).toBeInTheDocument();
  },
};

export const ChartOnly: Story = {
  args: {
    showLegend: false,
  },
};
