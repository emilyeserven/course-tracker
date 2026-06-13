import type { RadarBlip } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipLegendItem, BlipLegendSection } from "./radarLegendItem";

import { RouterStub } from "@/test-utils/RouterStub";

function makeBlip(id: string, topicName: string, description?: string): RadarBlip {
  return {
    id,
    domainId: "domain-1",
    quadrantId: "q-1",
    ringId: "r-1",
    topicId: `topic-${id}`,
    topicName,
    description,
  };
}

const blips = [
  makeBlip("a", "Kubernetes", "Container orchestration"),
  makeBlip("b", "Terraform"),
  makeBlip("c", "Prometheus", "Metrics + alerting"),
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

/** A single legend row in isolation (selected, so its actions are visible). */
export const SingleItem: StoryObj<typeof BlipLegendItem> = {
  render: args => (
    <RouterStub>
      <ul>
        <BlipLegendItem {...args} />
      </ul>
    </RouterStub>
  ),
  args: {
    blip: makeBlip("solo", "Kubernetes", "Container orchestration"),
    label: <span className="font-medium">Kubernetes</span>,
    isActive: false,
    isSelected: true,
    registerRef: fn(),
    onHover: fn(),
    onBlipClick: fn(),
    onDescriptionChange: fn(),
  },
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
