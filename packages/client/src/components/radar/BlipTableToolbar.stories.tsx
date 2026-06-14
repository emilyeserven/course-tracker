import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipTableToolbar } from "./BlipTableToolbar";

import { ALL } from "@/components/radar/blipTableFilters";
import { makeQuadrants, makeRings } from "@/test-utils/radarFixtures";

const quadrants = makeQuadrants();
const rings = makeRings();

const sliceCounts = {
  unassigned: 1,
  counts: new Map(quadrants.map((q, i) => [q.id, i + 1])),
};
const ringCounts = {
  unassigned: 1,
  counts: new Map(rings.map((r, i) => [r.id, i + 1])),
};

const meta: Meta<typeof BlipTableToolbar> = {
  component: BlipTableToolbar,
  args: {
    search: "",
    filterQuadrant: ALL,
    filterRing: ALL,
    showItemsColumn: true,
    quadrants,
    rings,
    blipCount: 6,
    sliceCounts,
    ringCounts,
    onSearchChange: fn(),
    onFilterQuadrantChange: fn(),
    onFilterRingChange: fn(),
    onShowItemsColumnChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText("Search topic or note"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Topic Items")).toBeInTheDocument();
  },
};

export const WithSearch: Story = {
  args: {
    search: "kube",
  },
};

export const ItemsHidden: Story = {
  args: {
    showItemsColumn: false,
  },
};
