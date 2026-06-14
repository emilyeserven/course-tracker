import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ScopeTab } from "./-ScopeTab";

import {
  makeRadar,
  makeScopedDomain,
  makeTopics,
} from "@/test-utils/radarFixtures";
import { smokePlay } from "@/test-utils/storyPlay";

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

export const Default: Story = {
  play: smokePlay([
    {
      text: "Within Scope",
    },
    {
      text: /Out of Scope/,
    },
    {
      role: "button",
      name: /save scope/i,
    },
  ]),
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
