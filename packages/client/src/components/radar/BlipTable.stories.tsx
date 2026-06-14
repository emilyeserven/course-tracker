import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipTable } from "./BlipTable";

import {
  makeBlips,
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";
import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof BlipTable> = {
  component: BlipTable,
  args: {
    blips: makeBlips(6),
    quadrants: makeQuadrants(),
    rings: makeRings(),
    topics: makeTopics(),
    onSave: fn(() => Promise.resolve()),
    onRemove: fn(() => Promise.resolve()),
    onBulkSave: fn(() => Promise.resolve()),
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Kubernetes"),
};
