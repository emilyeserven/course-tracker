import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ReviewTable } from "./BlipLlmReviewTable";

import {
  byId,
  makeQuadrants,
  makeResolvedEntry,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";

const quadrants = makeQuadrants();
const rings = makeRings();
const topics = makeTopics();

const meta: Meta<typeof ReviewTable> = {
  component: ReviewTable,
  args: {
    resolved: [
      makeResolvedEntry({
        topicName: "Kubernetes",
        selected: true,
      }),
      makeResolvedEntry({
        topicName: "Terraform",
        resolution: "updateBlip",
        existingBlipId: "blip-1",
      }),
      makeResolvedEntry({
        topicName: "Rust",
        willCreateTopic: true,
        matchedTopicId: null,
        resolution: "create",
      }),
      makeResolvedEntry({
        topicName: "Vitest",
        resolution: "skip",
      }),
    ],
    quadrants,
    rings,
    quadrantById: byId(quadrants),
    ringById: byId(rings),
    topicById: byId(topics),
    updateEntry: fn(),
    startEdit: fn(),
    commitEdit: fn(),
    cancelEdit: fn(),
    updateDraft: fn(),
    setRowSelected: fn(),
    setAllSelected: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
