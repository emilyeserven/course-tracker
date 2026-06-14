import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RadarStripSection } from "./-RadarStripSection";

import {
  makeBlips,
  makePositionedBlips,
  makeQuadrants,
} from "@/test-utils/radarFixtures";
import { svgStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof RadarStripSection> = {
  component: RadarStripSection,
  args: {
    mode: "adopted",
    positioned: makePositionedBlips(makeBlips(4)),
    sortedQuadrants: makeQuadrants(),
    sectionName: "Adopted",
    labelY: 24,
    size: 400,
    activeBlipId: null,
    selectedBlipId: null,
    onHover: fn(),
    onClick: fn(),
  },
  decorators: [
    svgStoryDecorator({
      width: 400,
      height: 400,
      tooltip: true,
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Adopted: Story = {};

export const Ignored: Story = {
  args: {
    mode: "ignored",
    sectionName: "Ignored",
  },
};
