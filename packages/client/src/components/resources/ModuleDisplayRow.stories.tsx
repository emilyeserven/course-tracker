import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { ModuleDisplayRow } from "./ModuleDisplayRow";

import { makeModule } from "@/test-utils/resourceModulesFixtures";

const meta: Meta<typeof ModuleDisplayRow> = {
  component: ModuleDisplayRow,
  args: {
    module: makeModule(),
    isAnyEditing: false,
    isReordering: false,
    canMoveUp: true,
    canMoveDown: true,
    onMoveUp: fn(),
    onMoveDown: fn(),
    onSetStatus: fn(),
    onOpenDetails: fn(),
    onEdit: fn(),
    onLogInteraction: fn(),
    isStatusPending: false,
  },
  // The component renders an <li>, so host it in a <ul>.
  decorators: [
    Story => (
      <ul className="max-w-md rounded-md border">
        <Story />
      </ul>
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
    await expect(canvas.getByText("Getting Started")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /Status: Unstarted/i,
      }),
    ).toBeInTheDocument();
  },
};

export const InProgress: Story = {
  args: {
    module: makeModule({
      status: "in_progress",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /Status: In Progress/i,
      }),
    ).toBeInTheDocument();
  },
};

export const Complete: Story = {
  args: {
    module: makeModule({
      status: "complete",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /Status: Complete/i,
      }),
    ).toBeInTheDocument();
  },
};

export const RangeLength: Story = {
  args: {
    module: makeModule({
      length: "long",
    }),
  },
};

export const ReorderMode: Story = {
  args: {
    reorderMode: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The desktop drag handle is responsive-hidden via CSS, so query it
    // including hidden elements.
    await expect(
      canvas.getByRole("button", {
        name: /Drag to reorder/i,
        hidden: true,
      }),
    ).toBeInTheDocument();
  },
};

export const NotExpandable: Story = {
  args: {
    module: makeModule({
      description: null,
      url: null,
      length: null,
      tags: [],
    }),
    expandable: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Getting Started")).toBeInTheDocument();
    // With nothing to show, the name is plain text — not an open-details button.
    await expect(
      canvas.queryByRole("button", {
        name: /Open details/i,
      }),
    ).not.toBeInTheDocument();
  },
};
