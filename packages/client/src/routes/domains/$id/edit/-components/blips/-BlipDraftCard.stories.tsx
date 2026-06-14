import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipDraftCard } from "./-BlipDraftCard";

import {
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";

const topics = makeTopics();
const quadrants = makeQuadrants();
const rings = makeRings();

const meta: Meta<typeof BlipDraftCard> = {
  component: BlipDraftCard,
  args: {
    blip: {
      topicId: "topic-0",
      description: "",
      quadrantId: quadrants[0].id,
      ringId: rings[0].id,
      localKey: "draft-1",
    },
    topics,
    usedTopicIds: new Set<string>(),
    topicById: new Map(
      topics.map(t => [
        t.id,
        {
          name: t.name,
          description: t.description,
        },
      ]),
    ),
    topicNameById: new Map(topics.map(t => [t.id, t.name])),
    persistedQuadrants: quadrants,
    persistedRings: rings,
    pending: false,
    onChangeTopic: fn(),
    onChangeQuadrant: fn(),
    onChangeRing: fn(),
    onChangeDescription: fn(),
    onSave: fn(),
    onRemove: fn(),
  },
  // The component renders an <li>, so give it a list parent for valid markup.
  decorators: [
    Story => (
      <ul className="flex flex-col gap-4">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// No topic chosen yet: the picked-topic preview is hidden.
export const NoTopicSelected: Story = {
  args: {
    blip: {
      topicId: "",
      description: "",
      quadrantId: quadrants[0].id,
      ringId: rings[0].id,
      localKey: "draft-2",
    },
  },
};

// While a save is in flight the buttons disable and a spinner shows.
export const Saving: Story = {
  args: {
    pending: true,
  },
};
