import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { IgnoreRow } from "./-IgnoreRow";

import { makeTopics } from "@/test-utils/radarFixtures";

const topics = makeTopics();

const meta: Meta<typeof IgnoreRow> = {
  component: IgnoreRow,
  args: {
    row: {
      topicId: "",
      reason: "",
      localKey: "ignore-1",
    },
    topics,
    usedIgnoreTopicIds: new Set<string>(),
    withinTopicIds: [],
    onRadarTopicIds: new Set<string>(),
    onChange: fn(),
    onRemove: fn(),
  },
  // The component renders an <li>, so give it a list parent for valid markup.
  decorators: [
    Story => (
      <ul className="flex flex-col gap-3">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithSelection: Story = {
  args: {
    row: {
      blipId: "blip-2",
      topicId: "topic-2",
      reason: "Replaced by OpenTelemetry.",
      localKey: "ignore-2",
    },
  },
};
