import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipsTabContainer } from "./-BlipsTab";

import { makeRadar, makeTopics } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof BlipsTabContainer> = {
  component: BlipsTabContainer,
  args: {
    radar: makeRadar(),
    topics: makeTopics(),
    domainId: "domain-1",
    onSaved: fn(() => Promise.resolve()),
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

// Lists the radar's persisted blips in the editable table.
export const WithBlips: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Kubernetes")).toBeInTheDocument();
  },
};

// Without persisted slices/rings the panel blocks blip creation.
export const NotConfigured: Story = {
  args: {
    radar: makeRadar({
      quadrants: [],
      rings: [],
      blips: [],
    }),
  },
};
