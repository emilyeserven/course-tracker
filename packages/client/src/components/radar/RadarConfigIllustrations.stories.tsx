import type { Meta, StoryObj } from "@storybook/react-vite";

import { QuadrantsIllustration } from "./RadarConfigIllustrations";

import { makeQuadrants } from "@/test-utils/radarFixtures";

const meta: Meta<typeof QuadrantsIllustration> = {
  component: QuadrantsIllustration,
  args: {
    names: makeQuadrants().map(q => q.name),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Quadrants: Story = {};
