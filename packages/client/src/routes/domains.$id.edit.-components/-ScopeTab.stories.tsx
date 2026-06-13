import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { ScopeTab } from "./-ScopeTab";

import { makeDomain, makeRadar, makeTopics } from "@/test-utils/radarFixtures";

const meta: Meta<typeof ScopeTab> = {
  component: ScopeTab,
  args: {
    domain: makeDomain(),
    radar: makeRadar(),
    topics: makeTopics(),
    onSaved: fn(() => Promise.resolve()),
    onChangeStateChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Within Scope")).toBeInTheDocument();
    await expect(canvas.getByText(/Out of Scope/)).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save scope/i,
      }),
    ).toBeInTheDocument();
  },
};

// A domain whose radar already has ignored blips renders pre-filled
// out-of-scope rows the user can edit or remove.
export const WithIgnoredTopics: Story = {
  args: {
    radar: makeRadar({
      blips: [
        {
          id: "blip-ignored",
          domainId: "domain-1",
          quadrantId: null,
          ringId: null,
          topicId: "topic-2",
          topicName: "Prometheus",
          description: "Replaced by OpenTelemetry.",
          isIgnored: true,
        },
      ],
    }),
  },
};
