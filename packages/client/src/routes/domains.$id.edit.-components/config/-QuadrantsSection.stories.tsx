import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { QuadrantsSection } from "./-QuadrantsSection";

import { makeQuadrants } from "@/test-utils/radarFixtures";

const quadrantDrafts = makeQuadrants().map((q, i) => ({
  id: q.id,
  name: q.name,
  position: i,
  localKey: `qk-${i}`,
}));

const meta: Meta<typeof QuadrantsSection> = {
  component: QuadrantsSection,
  args: {
    quadrants: quadrantDrafts,
    quadrantCount: quadrantDrafts.length,
    onChangeQuadrant: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The last slice is optional; an empty trailing name renders inactive (dimmed).
export const OptionalSliceBlank: Story = {
  args: {
    quadrants: [
      ...quadrantDrafts,
      {
        name: "",
        position: quadrantDrafts.length,
        localKey: `qk-${quadrantDrafts.length}`,
      },
    ],
    quadrantCount: quadrantDrafts.length + 1,
  },
};
