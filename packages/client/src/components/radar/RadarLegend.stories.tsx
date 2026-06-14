import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RadarLegend } from "./RadarLegend";

import {
  makeBlip,
  makeBlips,
  makePositionedBlips,
  makeQuadrants,
  makeRings,
} from "@/test-utils/radarFixtures";
import { routerDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof RadarLegend> = {
  component: RadarLegend,
  args: {
    quadrants: makeQuadrants(),
    rings: makeRings(),
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
