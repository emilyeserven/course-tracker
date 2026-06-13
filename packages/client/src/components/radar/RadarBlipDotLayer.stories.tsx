import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "@storybook/test";

import { RadarBlipDotLayer } from "./RadarBlipDotLayer";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  makeBlips,
  makePositionedBlips,
  makeQuadrants,
} from "@/test-utils/radarFixtures";

const meta: Meta<typeof RadarBlipDotLayer> = {
  component: RadarBlipDotLayer,
  args: {
    positioned: makePositionedBlips(makeBlips(5)),
    sortedQuadrants: makeQuadrants(),
    activeBlipId: null,
    selectedBlipId: null,
    dotRadius: 12,
    haloRadius: 20,
    fontSize: 12,
    clampQuadrantIndex: true,
    renderSubtitle: (quadrantName, blip) => quadrantName ?? blip.topicName,
    onHover: fn(),
    onClick: fn(),
  },
  decorators: [
    Story => (
      <TooltipProvider>
        <svg
          width={400}
          height={400}
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

export const WithActiveBlip: Story = {
  args: {
    activeBlipId: "blip-0",
  },
};
