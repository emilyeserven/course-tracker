import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";

import { expect, userEvent, within } from "storybook/test";

import { DataTable } from "./data-table";
import { DataTableColumnHeader } from "./data-table-column-header";

interface Fruit {
  id: string;
  name: string;
  count: number;
}

const columns: ColumnDef<Fruit>[] = [
  {
    id: "select",
    enableSorting: false,
    header: ({
      table,
    }) => (
      <input
        type="checkbox"
        aria-label="Select all"
        checked={table.getIsAllRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomeRowsSelected();
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({
      row,
    }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Name"
      />
    ),
    cell: ({
      row,
    }) => row.original.name,
  },
  {
    accessorKey: "count",
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Count"
        align="right"
      />
    ),
    cell: ({
      row,
    }) => row.original.count,
    meta: {
      align: "right",
    },
  },
];

const data: Fruit[] = [
  {
    id: "a",
    name: "Banana",
    count: 2,
  },
  {
    id: "b",
    name: "Avocado",
    count: 5,
  },
  {
    id: "c",
    name: "Cherry",
    count: 1,
  },
];

/** Non-generic harness so the story can be typed against a concrete component. */
function DataTableDemo() {
  return (
    <div className="w-full max-w-xl rounded-md border bg-card">
      <DataTable
        columns={columns}
        data={data}
        getRowId={r => r.id}
        enableSorting
        enableRowSelection
      />
    </div>
  );
}

const meta = {
  component: DataTableDemo,
} satisfies Meta<typeof DataTableDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    // Sorting: clicking the Name header orders rows ascending.
    await userEvent.click(canvas.getByRole("button", {
      name: /name/i,
    }));
    const firstRow = canvas.getAllByRole("row")[1];
    await expect(firstRow).toHaveTextContent("Avocado");

    // Selection: checking a row marks its <tr> as selected.
    const rowCheckbox = canvas.getByLabelText("Select Avocado");
    await userEvent.click(rowCheckbox);
    await expect(rowCheckbox.closest("tr")).toHaveAttribute(
      "data-state",
      "selected",
    );
  },
};
