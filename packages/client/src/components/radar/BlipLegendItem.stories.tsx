import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipLegendItem } from "./radarLegendItem";

import { makeBlip } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof BlipLegendItem> = {
  component: BlipLegendItem,
  args: {
    blip: makeBlip({
      id: "solo",
      topicId: "topic-solo",
      topicName: "Kubernetes",
      description: "Container orchestration",
    }),
    label: <span className="font-medium">Kubernetes</span>,
    isActive: false,
    isSelected: true,
    registerRef: fn(),
    onHover: fn(),
    onBlipClick: fn(),
    onDescriptionChange: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <ul>
          <Story />
        </ul>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

/** A single legend row in isolation (selected, so its actions are visible). */
export const Default: Story = {
  play: smokeText("Kubernetes", "Container orchestration"),
};

export const Active: Story = {
  args: {
    isActive: true,
  },
};
