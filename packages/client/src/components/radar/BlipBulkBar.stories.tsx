import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipBulkBar } from "./BlipBulkBar";
import { NO_CHANGE } from "./blipTableFilters";

import { makeQuadrants, makeRings } from "@/test-utils/radarFixtures";

const meta: Meta<typeof BlipBulkBar> = {
  component: BlipBulkBar,
  args: {
    selectedCount: 3,
    quadrants: makeQuadrants(),
    rings: makeRings(),
    bulkQuadrantId: NO_CHANGE,
    bulkRingId: NO_CHANGE,
    bulkPending: false,
    onBulkQuadrantChange: fn(),
    onBulkRingChange: fn(),
    onApply: fn(),
    onClear: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: {
    bulkPending: true,
    bulkQuadrantId: "q1",
  },
};
