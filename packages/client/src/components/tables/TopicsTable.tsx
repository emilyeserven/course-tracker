import type { SortDirection } from "@/components/ui/manualSort";
import type { TopicForTopicsPage } from "@emstack/types";
import type {
  ColumnDef,
  RowSelectionState,
  Updater,
} from "@tanstack/react-table";

import { useMemo } from "react";

import { DomainTagList, EntityLink } from "@/components/boxElements";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { EmptyDash } from "@/components/ui/EmptyDash";
import {
  makeManualSortHandler,
  toSortingState,
} from "@/components/ui/manualSort";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";

export type TopicsTableSortColumn
  = | "name"
    | "domains"
    | "resources"
    | "tasks"
    | "dailies";
export type TopicsTableSortDirection = SortDirection;

export interface TopicsTableSort {
  column: TopicsTableSortColumn;
  direction: TopicsTableSortDirection;
}

interface TopicsTableSelection {
  selectedIds: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
}

interface TopicsTableSortControl {
  sort?: TopicsTableSort;
  onSortChange?: (sort: TopicsTableSort) => void;
}

interface TopicsTableProps extends TopicsTableSortControl {
  topics: TopicForTopicsPage[];
  selection?: TopicsTableSelection;
}

// Responsive column hiding: DataTable applies these to both the <th> and <td>,
// so `hidden <bp>:table-cell` collapses a column below the breakpoint and
// restores it above it. Keeps narrow phones to select + name.
const HIDE_SM = "hidden sm:table-cell";
const HIDE_MD = "hidden md:table-cell";
const HIDE_LG = "hidden lg:table-cell";

// name/domains sort ascending on first click; the count columns sort descending.
const SORT_DESC_FIRST: Record<TopicsTableSortColumn, boolean> = {
  name: false,
  domains: false,
  resources: true,
  tasks: true,
  dailies: true,
};

function domainsCell(topic: TopicForTopicsPage) {
  return (
    <DomainTagList
      domains={topic.domains}
      fallback={<EmptyDash />}
    />
  );
}

export function TopicsTable({
  topics,
  selection,
  sort,
  onSortChange,
}: TopicsTableProps) {
  const sortingEnabled = !!onSortChange;

  const sorting = sort ? toSortingState(sort.column, sort.direction) : [];

  const handleSortingChange = makeManualSortHandler(sorting, (id, dir) => {
    onSortChange?.({
      column: id as TopicsTableSortColumn,
      direction: dir,
    });
  });

  const selectedIds = selection?.selectedIds;

  const rowSelection: RowSelectionState = useMemo(() => {
    const rec: RowSelectionState = {};
    selectedIds?.forEach((id) => {
      rec[id] = true;
    });
    return rec;
  }, [selectedIds]);

  function handleRowSelectionChange(updater: Updater<RowSelectionState>) {
    if (!selection) return;
    const next
      = typeof updater === "function" ? updater(rowSelection) : updater;
    selection.onSelectionChange(
      new Set(Object.keys(next).filter(id => next[id])),
    );
  }

  const columns: ColumnDef<TopicForTopicsPage>[] = useMemo(() => {
    const cols: ColumnDef<TopicForTopicsPage>[] = [];

    if (selection) {
      cols.push({
        id: "select",
        enableSorting: false,
        meta: {
          headClassName: "w-10",
          cellClassName: "w-10",
        },
        header: ({
          table,
        }) => (
          <SelectAllCheckbox
            className="size-4"
            aria-label="Select all topics"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onCheckedChange={value => table.toggleAllRowsSelected(value)}
          />
        ),
        cell: ({
          row,
        }) => (
          <input
            type="checkbox"
            className="size-4"
            aria-label={`Select ${row.original.name}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      });
    }

    cols.push(
      {
        id: "name",
        sortDescFirst: SORT_DESC_FIRST.name,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Name"
          />
        ),
        meta: {
          headClassName: "whitespace-nowrap",
          cellClassName: "font-medium whitespace-nowrap",
        },
        cell: ({
          row,
        }) => (
          <EntityLink
            entity="topics"
            id={row.original.id}
            className="hover:text-blue-600"
          >
            {row.original.name}
          </EntityLink>
        ),
      },
      {
        id: "domains",
        sortDescFirst: SORT_DESC_FIRST.domains,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Domains"
          />
        ),
        meta: {
          headClassName: `whitespace-nowrap ${HIDE_LG}`,
          cellClassName: `whitespace-nowrap ${HIDE_LG}`,
        },
        cell: ({
          row,
        }) => domainsCell(row.original),
      },
      {
        id: "description",
        enableSorting: false,
        header: "Description",
        meta: {
          headClassName: HIDE_MD,
          cellClassName: `max-w-md ${HIDE_MD}`,
        },
        cell: ({
          row,
        }) =>
          row.original.description
            ? (
              <span className="line-clamp-2 text-sm">
                {row.original.description}
              </span>
            )
            : (
              <EmptyDash />
            ),
      },
      {
        id: "resources",
        sortDescFirst: SORT_DESC_FIRST.resources,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Resources"
            align="right"
          />
        ),
        meta: {
          align: "right",
          headClassName: `whitespace-nowrap ${HIDE_SM}`,
          cellClassName: `tabular-nums ${HIDE_SM}`,
        },
        cell: ({
          row,
        }) => row.original.resourceCount ?? 0,
      },
      {
        id: "tasks",
        sortDescFirst: SORT_DESC_FIRST.tasks,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Tasks"
            align="right"
          />
        ),
        meta: {
          align: "right",
          headClassName: `whitespace-nowrap ${HIDE_SM}`,
          cellClassName: `tabular-nums ${HIDE_SM}`,
        },
        cell: ({
          row,
        }) => row.original.taskCount ?? 0,
      },
      {
        id: "dailies",
        sortDescFirst: SORT_DESC_FIRST.dailies,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Dailies"
            align="right"
          />
        ),
        meta: {
          align: "right",
          headClassName: `whitespace-nowrap ${HIDE_SM}`,
          cellClassName: `tabular-nums ${HIDE_SM}`,
        },
        cell: ({
          row,
        }) => row.original.dailyCount ?? 0,
      },
    );

    return cols;
  }, [selection]);

  return (
    <DataTable
      columns={columns}
      data={topics}
      getRowId={topic => topic.id}
      enableSorting={sortingEnabled}
      manualSorting
      sorting={sorting}
      onSortingChange={handleSortingChange}
      enableRowSelection={!!selection}
      rowSelection={selection ? rowSelection : undefined}
      onRowSelectionChange={selection ? handleRowSelectionChange : undefined}
      className="w-auto min-w-full"
      containerClassName="w-full rounded-md border bg-card"
    />
  );
}
