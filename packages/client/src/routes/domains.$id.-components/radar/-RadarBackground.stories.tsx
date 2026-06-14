import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadarBackground } from "./-RadarBackground";

import { computeRingRadii } from "@/components/radar/radarLayout";
import { makeQuadrants, makeRings } from "@/test-utils/radarFixtures";
import { svgStoryDecorator } from "@/test-utils/storyDecorators";

const SIZE = 400;
const quadrants = makeQuadrants();
const rings = makeRings();
const maxRadius = SIZE / 2 - 24;

const meta: Meta<typeof RadarBackground> = {
  component: RadarBackground,
  args: {
    cx: SIZE / 2,
    cy: SIZE / 2,
    maxRadius,
    angleStep: (Math.PI * 2) / quadrants.length,
    ringRadii: computeRingRadii(rings.length, maxRadius),
    sortedRings: rings,
    sortedQuadrants: quadrants,
  },
  decorators: [
    svgStoryDecorator({
      width: SIZE,
      height: SIZE,
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
