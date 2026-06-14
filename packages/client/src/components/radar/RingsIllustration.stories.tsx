import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RingsIllustration } from "./RadarConfigIllustrations";

import { makeRings } from "@/test-utils/radarFixtures";

const meta: Meta<typeof RingsIllustration> = {
  component: RingsIllustration,
  args: {
    names: makeRings().map(r => r.name),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Adopt")).toBeInTheDocument();
  },
};
