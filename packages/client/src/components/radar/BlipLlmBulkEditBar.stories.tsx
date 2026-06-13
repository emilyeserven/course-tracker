import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BulkEditBar } from "./BlipLlmBulkEditBar";

import {
  makeQuadrants,
  makeResolvedEntry,
  makeRings,
} from "@/test-utils/radarFixtures";

const meta: Meta<typeof BulkEditBar> = {
  component: BulkEditBar,
  args: {
    resolved: [
      makeResolvedEntry({
        topicName: "Kubernetes",
        selected: true,
      }),
      makeResolvedEntry({
        topicName: "Terraform",
        selected: true,
      }),
      makeResolvedEntry({
        topicName: "Rust",
        selected: false,
      }),
    ],
    quadrants: makeQuadrants(),
    rings: makeRings(),
    onBulkQuadrant: fn(),
    onBulkRing: fn(),
    onBulkResolution: fn(),
    onClearDescriptions: fn(),
    onClearRadarNotes: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Bulk edit/)).toBeInTheDocument();
  },
};
