import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipLegendSection } from "./radarLegendItem";

import { makeBlip } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const blips = [
  makeBlip({
    id: "a",
    topicId: "topic-a",
    topicName: "Kubernetes",
    description: "Container orchestration",
  }),
  makeBlip({
    id: "b",
    topicId: "topic-b",
    topicName: "Terraform",
  }),
  makeBlip({
    id: "c",
    topicId: "topic-c",
    topicName: "Prometheus",
    description: "Metrics + alerting",
  }),
];

const meta: Meta<typeof BlipLegendSection> = {
  component: BlipLegendSection,
  args: {
    title: "Tools",
    headingClassName: "text-sm font-semibold uppercase",
    activeBlipId: null,
    selectedBlipId: null,
    registerRef: fn(),
    onHover: fn(),
    onBlipClick: fn(),
    onDescriptionChange: fn(),
    items: blips.map((blip, idx) => ({
      blip,
      label: (
        <>
          <span className="mr-1 inline-block font-mono text-xs">
            {idx + 1}
            .
          </span>
          <span className="font-medium">{blip.topicName}</span>
        </>
      ),
    })),
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Section: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Kubernetes")).toBeInTheDocument();
    await expect(canvas.getByText("Terraform")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: "No blips yet.",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("No blips yet.")).toBeInTheDocument();
  },
};
