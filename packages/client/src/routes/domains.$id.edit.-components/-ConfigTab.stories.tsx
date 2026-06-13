import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { ConfigTab } from "./-ConfigTab";

import { makeRadar } from "@/test-utils/radarFixtures";

const meta: Meta<typeof ConfigTab> = {
  component: ConfigTab,
  args: {
    radar: makeRadar(),
    domainId: "domain-1",
    onSaved: fn(() => Promise.resolve()),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Hydrates the slice/ring editors from the persisted radar config.
export const FromConfig: Story = {
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

// With no persisted radar the container seeds the default slices and rings.
export const Defaults: Story = {
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
    await expect(canvas.getByDisplayValue("Adopt")).toBeInTheDocument();
  },
};
