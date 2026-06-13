import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

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

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 selected")).toBeInTheDocument();
  },
};

export const Pending: Story = {
  args: {
    bulkPending: true,
    bulkQuadrantId: "q1",
  },
};
