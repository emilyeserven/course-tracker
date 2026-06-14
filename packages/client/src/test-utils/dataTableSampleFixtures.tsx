import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export interface DataTableSampleRow {
  id: string;
  name: string;
  count: number;
}

/**
 * Select / Name / Count columns shared by the DataTable story and unit test so
 * both exercise the same column shapes (sortable header, right-aligned numeric
 * column, row-selection checkboxes) without re-declaring them.
 */
export const dataTableSampleColumns: ColumnDef<DataTableSampleRow>[] = [
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

// Capitalized, distinct initials so ordering is unambiguous regardless of the
// sort fn's case handling. Initial order is intentionally unsorted.
export const dataTableSampleRows: DataTableSampleRow[] = [
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
