import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Column } from "@tanstack/react-table";

import { fn } from "storybook/test";

import { DataTableColumnHeader } from "./data-table-column-header";

/**
 * Non-generic harness that fakes the slice of the TanStack `Column` API the
 * header actually calls, so it can be storied without wiring up a full table.
 */
function ColumnHeaderDemo({
  label,
  align,
  hideLabel,
  canSort = true,
  sorted = false,
  onToggle,
}: {
  label: string;
  align?: "left" | "right";
  hideLabel?: boolean;
  canSort?: boolean;
  sorted?: false | "asc" | "desc";
  onToggle?: () => void;
}) {
  const column = {
    getCanSort: () => canSort,
    getIsSorted: () => sorted,
    getToggleSortingHandler: () => onToggle,
  } as unknown as Column<unknown, unknown>;

  return (
    <DataTableColumnHeader
      column={column}
      label={label}
      align={align}
      hideLabel={hideLabel}
    />
  );
}

const meta: Meta<typeof ColumnHeaderDemo> = {
  component: ColumnHeaderDemo,
  args: {
    label: "Name",
    onToggle: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// A sortable column renders a button that toggles the column's sort.
export const Sortable: Story = {};

export const SortedAscending: Story = {
  args: {
    sorted: "asc",
  },
};

export const SortedDescending: Story = {
  args: {
    sorted: "desc",
  },
};

// A non-sortable column renders a plain label, not a button.
export const NotSortable: Story = {
  args: {
    canSort: false,
  },
};

// The label is kept for screen readers even when visually hidden.
export const HideLabel: Story = {
  args: {
    hideLabel: true,
  },
};
