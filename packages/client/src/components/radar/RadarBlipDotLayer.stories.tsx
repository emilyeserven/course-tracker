import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RadarBlipDotLayer } from "./RadarBlipDotLayer";

import {
  makeBlips,
  makePositionedBlips,
  makeQuadrants,
} from "@/test-utils/radarFixtures";
import { svgStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

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
  decorators: [svgStoryDecorator({
    width: 400,
    height: 400,
    tooltip: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokePlay([{
    text: "1",
  }]),
};

export const WithActiveBlip: Story = {
  args: {
    activeBlipId: "blip-0",
  },
};
