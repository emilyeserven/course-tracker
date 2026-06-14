import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipLegendItem } from "./radarLegendItem";

import { makeBlip } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Kubernetes")).toBeInTheDocument();
    await expect(
      canvas.getByText("Container orchestration"),
    ).toBeInTheDocument();
  },
};

export const Active: Story = {
  args: {
    isActive: true,
  },
};
