import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { LlmTabContainer } from "./-LlmTab";

import {
  makeRadar,
  makeScopedDomain,
  makeTopics,
} from "@/test-utils/radarFixtures";

const meta: Meta<typeof LlmTabContainer> = {
  component: LlmTabContainer,
  args: {
    radar: makeRadar(),
    domain: makeScopedDomain(),
    topics: makeTopics(),
    onComplete: fn(() => Promise.resolve()),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

// Without persisted quadrants/rings the container reports config as not yet
// saved, so the wrapped panel shows its "configure first" guard instead.
export const NotConfigured: Story = {
  args: {
    radar: makeRadar({
      quadrants: [],
      rings: [],
      blips: [],
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Save your slices and rings/),
    ).toBeInTheDocument();
  },
};
