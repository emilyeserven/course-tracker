import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ConfigTab } from "./-ConfigTab";

import { makeRadar } from "@/test-utils/radarFixtures";
import { smokePlay } from "@/test-utils/storyPlay";

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
  play: smokePlay([
    {
      displayValue: "Techniques",
    },
    {
      role: "button",
      name: /save configuration/i,
    },
  ]),
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
  play: smokePlay([{
    displayValue: "Adopt",
  }]),
};
