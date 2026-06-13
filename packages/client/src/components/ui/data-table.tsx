import type {
  ColumnDef,
  OnChangeFn,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  TableMeta,
  TableOptions,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Fragment, useMemo, useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Per-column styling, expressed declaratively on each column's `meta`.
declare module "@tanstack/react-table" {
  // The type params must mirror the original declaration for merging to work.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Extra classes for the column's `<th>`. */
    headClassName?: string;
    /** Extra classes for the column's `<td>`. */
    cellClassName?: string;
    /** Convenience for right-aligning a column's header and cells. */
    align?: "left" | "right";
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId?: (originalRow: TData, index: number) => string;

  // Sorting — pass `sorting`/`onSortingChange` to control it, or `enableSorting`
  // for table-managed state. `manualSorting` keeps pre-sorted `data` untouched
  // (the header still reflects/toggles the controlled `sorting` state).
  enableSorting?: boolean;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  // Row selection.
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  // Global filter.
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  globalFilterFn?: TableOptions<TData>["globalFilterFn"];

  /** Forwarded to `table.options.meta` — handy for cell callbacks. */
  meta?: TableMeta<TData>;

  /** Render a row yourself (inline-edit / multi-cell rows). */
  renderRow?: (row: Row<TData>) => ReactNode;
  /** Rendered inside `<TableBody>` when there are no rows. */
  renderEmpty?: () => ReactNode;
  /** Classes for the inner `<table>`. */
  className?: string;
  /** Classes for the wrapping `<div>` (borders, max-height, etc.). */
  containerClassName?: string;
}

function ariaSortValue(
  canSort: boolean,
  sorted: false | "asc" | "desc",
): "ascending" | "descending" | "none" | undefined {
  if (!canSort) return undefined;
  if (sorted === "asc") return "ascending";
  if (sorted === "desc") return "descending";
  return "none";
}

/**
 * Headless-table renderer built on TanStack Table + the shadcn `ui/table`
 * primitives. Self-contained: pass `columns` + `data` plus opt-in sorting,
 * row-selection, and global-filter state. Use `renderRow` for tables whose
 * rows can't be expressed as independent cells (inline editors, the daily
 * tracker's connector cells).
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  enableSorting,
  manualSorting,
  sorting,
  onSortingChange,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  globalFilter,
  onGlobalFilterChange,
  globalFilterFn,
  meta,
  renderRow,
  renderEmpty,
  className,
  containerClassName,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalSelection, setInternalSelection]
    = useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");

  const sortingState = sorting ?? internalSorting;
  const selectionState = rowSelection ?? internalSelection;
  const globalFilterState = globalFilter ?? internalGlobalFilter;

  const sortingEnabled
    = enableSorting ?? (sorting != null || onSortingChange != null);
  const filteringEnabled
    = globalFilter != null || onGlobalFilterChange != null;

  // TanStack's `getCanSort` requires an accessor, so a display column (id +
  // cell, no accessor) can't sort even in `manualSorting` mode. When sorting is
  // on, give such columns — unless they opt out with `enableSorting: false` — a
  // no-op accessor so `DataTableColumnHeader`'s toggle works. Ordering itself is
  // the table's (or, under `manualSorting`, the caller's pre-sorted data's) job.
  const preparedColumns = useMemo(() => {
    if (!sortingEnabled) return columns;
    return columns.map((column) => {
      const hasAccessor = "accessorKey" in column || "accessorFn" in column;
      if (hasAccessor || column.enableSorting === false) return column;
      return {
        ...column,
        accessorFn: () => undefined,
      };
    });
  }, [columns, sortingEnabled]);

  const table = useReactTable<TData>({
    data,
    columns: preparedColumns,
    getRowId,
    state: {
      sorting: sortingState,
      rowSelection: selectionState,
      globalFilter: globalFilterState,
    },
    enableSorting: sortingEnabled,
    enableMultiSort: false,
    // Match the app's existing headers: clicking a sorted column toggles
    // asc/desc and never clears the sort.
    enableSortingRemoval: false,
    manualSorting,
    enableRowSelection,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onRowSelectionChange: onRowSelectionChange ?? setInternalSelection,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
    globalFilterFn,
    meta,
    getCoreRowModel: getCoreRowModel(),
    ...(sortingEnabled && !manualSorting
      ? {
        getSortedRowModel: getSortedRowModel(),
      }
      : {}),
    ...(filteringEnabled
      ? {
        getFilteredRowModel: getFilteredRowModel(),
      }
      : {}),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={containerClassName}>
      <Table className={className}>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const colMeta = header.column.columnDef.meta;
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={ariaSortValue(
                      header.column.getCanSort(),
                      header.column.getIsSorted(),
                    )}
                    className={cn(
                      colMeta?.align === "right" && "text-right",
                      colMeta?.headClassName,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0
            ? renderEmpty?.()
            : rows.map(row =>
              renderRow
                ? (
                  <Fragment key={row.id}>{renderRow(row)}</Fragment>
                )
                : (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const colMeta = cell.column.columnDef.meta;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            colMeta?.align === "right" && "text-right",
                            colMeta?.cellClassName,
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
        </TableBody>
      </Table>
    </div>
  );
}
