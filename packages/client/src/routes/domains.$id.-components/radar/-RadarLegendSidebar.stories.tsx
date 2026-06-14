import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RadarLegendSidebar } from "./-RadarLegendSidebar";

import {
  makeBlip,
  makeBlips,
  makePositionedBlips,
  makeQuadrants,
  makeRings,
} from "@/test-utils/radarFixtures";
import { routerDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof RadarLegendSidebar> = {
  component: RadarLegendSidebar,
  args: {
    sortedQuadrants: makeQuadrants(),
    sortedRings: makeRings(),
    positionedBlips: makePositionedBlips(makeBlips(6)),
    adoptedBlips: [
      makeBlip({
        id: "adopted-0",
        topicName: "Jenkins",
      }),
    ],
    adoptedSectionName: "Adopted",
    ignoredBlips: [
      makeBlip({
        id: "ignored-0",
        topicName: "Subversion",
      }),
    ],
    showAdoptedDots: false,
    setShowAdoptedDots: fn(),
    showIgnoredDots: false,
    setShowIgnoredDots: fn(),
    activeBlipId: null,
    selectedBlipId: null,
    onDescriptionChange: fn(),
    onHover: fn(),
    onBlipClick: fn(),
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutToggles: Story = {
  args: {
    adoptedBlips: [],
    ignoredBlips: [],
  },
};
