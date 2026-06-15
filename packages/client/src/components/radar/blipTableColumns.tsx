import type { RadarBlip } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";

/**
 * Column definitions for the BlipTable data table. Split out of BlipTable so the
 * component stays focused on state/handlers; the `items` column is conditional
 * on the toolbar's "Topic Items" toggle. Cells are rendered by BlipTable's
 * `renderRow`, so these defs carry headers only.
 */
export function buildBlipColumns(showItemsColumn: boolean): ColumnDef<RadarBlip>[] {
  const cols: ColumnDef<RadarBlip>[] = [
    {
      id: "select",
      enableSorting: false,
      meta: {
        headClassName: "w-1",
      },
      header: ({
        table,
      }) => (
        <SelectAllCheckbox
          aria-label="Select all visible"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={value => table.toggleAllRowsSelected(value)}
          disabled={table.getRowModel().rows.length === 0}
        />
      ),
    },
    {
      id: "topic",
      sortDescFirst: false,
      header: ({
        column,
      }) => (
        <DataTableColumnHeader
          column={column}
          label="Topic"
        />
      ),
    },
    {
      id: "slice",
      sortDescFirst: false,
      header: ({
        column,
      }) => (
        <DataTableColumnHeader
          column={column}
          label="Slice"
        />
      ),
    },
    {
      id: "ring",
      sortDescFirst: false,
      header: ({
        column,
      }) => (
        <DataTableColumnHeader
          column={column}
          label="Ring"
        />
      ),
    },
    {
      id: "radarNote",
      enableSorting: false,
      header: "Radar Note",
    },
  ];

  if (showItemsColumn) {
    cols.push({
      id: "items",
      sortDescFirst: false,
      header: ({
        column,
      }) => (
        <DataTableColumnHeader
          column={column}
          label="Topic Items"
        />
      ),
    });
  }

  cols.push({
    id: "actions",
    enableSorting: false,
    meta: {
      align: "right",
      headClassName: "w-1",
    },
    header: "Actions",
  });

  return cols;
}
