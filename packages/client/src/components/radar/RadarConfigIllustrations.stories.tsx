import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

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

export const Quadrants: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Techniques")).toBeInTheDocument();
  },
};
