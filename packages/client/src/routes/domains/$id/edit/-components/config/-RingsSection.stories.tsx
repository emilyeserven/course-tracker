import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RingsSection } from "./-RingsSection";

import { makeRings } from "@/test-utils/radarFixtures";

const ringDrafts = makeRings().map((r, i) => ({
  id: r.id,
  name: r.name,
  position: i,
  localKey: `rk-${i}`,
}));

const meta: Meta<typeof RingsSection> = {
  component: RingsSection,
  args: {
    rings: ringDrafts,
    maxRings: 6,
    hasAdoptedSection: false,
    onChangeRing: fn(),
    onAddRing: fn(),
    onRemoveRing: fn(),
    onToggleAdoptedSection: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// An adopted ring renders as a non-removable "Side panel" badge row.
export const WithAdoptedSection: Story = {
  args: {
    hasAdoptedSection: true,
    rings: [
      ...ringDrafts,
      {
        name: "Adopted",
        position: ringDrafts.length,
        localKey: `rk-${ringDrafts.length}`,
        isAdopted: true,
      },
    ],
  },
};
