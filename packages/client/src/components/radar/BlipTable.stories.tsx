import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipTable } from "./BlipTable";

import {
  makeBlips,
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof BlipTable> = {
  component: BlipTable,
  args: {
    blips: makeBlips(6),
    quadrants: makeQuadrants(),
    rings: makeRings(),
    topics: makeTopics(),
    onSave: fn(() => Promise.resolve()),
    onRemove: fn(() => Promise.resolve()),
    onBulkSave: fn(() => Promise.resolve()),
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Kubernetes")).toBeInTheDocument();
  },
};
