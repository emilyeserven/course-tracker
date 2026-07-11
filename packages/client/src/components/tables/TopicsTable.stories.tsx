import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { TopicsTable } from "./TopicsTable";

import { makeTopicRows } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof TopicsTable> = {
  component: TopicsTable,
  args: {
    topics: makeTopicRows(3),
  },
  decorators: [cardStoryDecorator()],
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

// Low-priority columns collapse on narrow screens via `hidden <bp>:table-cell`
// (applied to the column's <th> and <td>); name stays visible.
export const ResponsiveColumns: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // Name header (wrapped in a sort button) lives in a never-hidden <th>.
    const nameHead = (await canvas.findByText("Name")).closest("th");
    await expect(nameHead).not.toHaveClass("hidden");
    // Detail columns hide below their breakpoint.
    await expect(await canvas.findByText("Description")).toHaveClass("hidden");
    const resourcesHead = (await canvas.findByText("Resources")).closest("th");
    await expect(resourcesHead).toHaveClass("hidden");
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
