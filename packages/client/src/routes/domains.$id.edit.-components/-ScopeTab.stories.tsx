import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ScopeTab } from "./-ScopeTab";

import {
  makeRadar,
  makeScopedDomain,
  makeTopics,
} from "@/test-utils/radarFixtures";

const meta: Meta<typeof ScopeTab> = {
  component: ScopeTab,
  args: {
    domain: makeScopedDomain(),
    radar: makeRadar(),
    topics: makeTopics(),
    onSaved: fn(() => Promise.resolve()),
    onChangeStateChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
