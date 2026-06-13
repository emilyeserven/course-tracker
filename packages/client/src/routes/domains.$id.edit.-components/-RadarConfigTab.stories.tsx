import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { RadarConfigTab } from "./-RadarConfigTab";

import { makeQuadrants, makeRings } from "@/test-utils/radarFixtures";

const quadrantDrafts = makeQuadrants().map((q, i) => ({
  id: q.id,
  name: q.name,
  position: i,
  localKey: `qk-${i}`,
}));

const ringDrafts = makeRings().map((r, i) => ({
  id: r.id,
  name: r.name,
  position: i,
  localKey: `rk-${i}`,
}));

const meta: Meta<typeof RadarConfigTab> = {
  component: RadarConfigTab,
  args: {
    quadrants: quadrantDrafts,
    rings: ringDrafts,
    quadrantCount: quadrantDrafts.length,
    maxRings: 6,
    isSaving: false,
    hasAdoptedSection: false,
    onChangeQuadrant: fn(),
    onChangeRing: fn(),
    onAddRing: fn(),
    onRemoveRing: fn(),
    onToggleAdoptedSection: fn(),
    onSave: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("Techniques")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save configuration/i,
      }),
    ).toBeInTheDocument();
  },
};

export const Saving: Story = {
  args: {
    isSaving: true,
  },
};

export const WithAdoptedSection: Story = {
  args: {
    hasAdoptedSection: true,
  },
};
