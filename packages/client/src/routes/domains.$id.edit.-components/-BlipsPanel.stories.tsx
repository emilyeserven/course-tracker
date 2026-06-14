import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipsPanel } from "./-BlipsPanel";

import {
  makeBlips,
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";
import { routerDecorator } from "@/test-utils/storyDecorators";

const topics = makeTopics();

const meta: Meta<typeof BlipsPanel> = {
  component: BlipsPanel,
  args: {
    allConfigPersisted: true,
    savedBlipsForTable: makeBlips(4),
    newBlipDrafts: [],
    persistedQuadrants: makeQuadrants(),
    persistedRings: makeRings(),
    topics,
    usedTopicIds: new Set(["topic-0", "topic-1"]),
    pendingBlipKey: null,
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
    onAddBlip: fn(),
    onChangeBlipTopic: fn(),
    onChangeBlipQuadrant: fn(),
    onChangeBlipRing: fn(),
    onChangeBlipDescription: fn(),
    onSaveBlip: fn(),
    onRemoveBlip: fn(),
    onTableSave: fn(() => Promise.resolve()),
    onTableRemove: fn(() => Promise.resolve()),
    onTableBulkSave: fn(() => Promise.resolve()),
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
