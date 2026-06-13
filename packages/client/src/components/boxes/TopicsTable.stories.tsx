import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { TopicsTable } from "./TopicsTable";

import { makeTopicRows } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof TopicsTable> = {
  component: TopicsTable,
  args: {
    topics: makeTopicRows(3),
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

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Topic 1")).toBeInTheDocument();
    await expect(await canvas.findByText("Topic 3")).toBeInTheDocument();
  },
};

export const WithSelection: Story = {
  args: {
    selection: {
      selectedIds: new Set(["topic-1"]),
      onSelectionChange: fn(),
    },
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("checkbox", {
        name: "Select all topics",
      }),
    ).toBeInTheDocument();
  },
};

export const Sortable: Story = {
  args: {
    sort: {
      column: "name",
      direction: "asc",
    },
    onSortChange: fn(),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", {
        name: /Name/,
      }),
    ).toBeInTheDocument();
  },
};
