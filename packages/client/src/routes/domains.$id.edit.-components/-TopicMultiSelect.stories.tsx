import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { TopicMultiSelect } from "./-TopicMultiSelect";

import { makeTopics } from "@/test-utils/radarFixtures";

const options = makeTopics().map(t => ({
  value: t.id,
  label: t.name,
}));

const meta: Meta<typeof TopicMultiSelect> = {
  component: TopicMultiSelect,
  args: {
    options,
    value: ["topic-0", "topic-1"],
    placeholder: "Add topics…",
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSelection: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Kubernetes")).toBeInTheDocument();
    await expect(canvas.getByText("Terraform")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    value: [],
  },
};
