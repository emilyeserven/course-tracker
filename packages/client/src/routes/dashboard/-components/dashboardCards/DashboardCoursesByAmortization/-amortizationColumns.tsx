import type { CourseRow, ProviderRow } from "./-amortizationRows";
import type {
  ColumnDef,
  ColumnMeta,
  HeaderContext,
} from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../DashboardCard/-cardKit";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCurrency } from "@/utils";

/** Name-column cell linking to an entity's detail page (course or provider). */
function NameLink({
  to,
  id,
  name,
}: {
  to: "/resources/$id" | "/providers/$id";
  id: string;
  name: string;
}) {
  return (
    <Link
      to={to}
      params={{
        id,
      }}
      className="hover:text-blue-600"
    >
      {name}
    </Link>
  );
}

// The cost-per-unit column's header and meta are identical for both tables;
// only the cell body (course vs provider breakdown) differs.
const costPerUnitMeta = {
  align: "right",
  headClassName: "whitespace-nowrap",
  cellClassName: "whitespace-nowrap",
} as const satisfies ColumnMeta<unknown, unknown>;

function costPerUnitHeader<T>({
  column,
}: HeaderContext<T, unknown>) {
  return (
    <DataTableColumnHeader
      column={column}
      label="Cost per Unit"
      align="right"
    />
  );
}

export const courseColumns: ColumnDef<CourseRow>[] = [
  {
    id: "name",
    // name sorts ascending on first click, cost-per-unit descending.
    sortDescFirst: false,
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Course"
      />
    ),
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "font-medium whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <NameLink
        to="/resources/$id"
        id={row.original.resource.id}
        name={row.original.resource.name}
      />
    ),
  },
  {
    id: "costPerUnit",
    sortDescFirst: true,
    header: costPerUnitHeader,
    meta: costPerUnitMeta,
    cell: ({
      row,
    }) => {
      const {
        effectiveCost,
        progressCurrent,
        progressTotal,
        costPerUnit,
        isUnstarted,
      } = row.original;
      return (
        <Popover>
          <PopoverTrigger
            className={cn(
              `
                cursor-pointer underline-offset-2
                hover:underline
              `,
              isUnstarted && "text-muted-foreground",
            )}
          >
            {costPerUnit === null ? "—" : formatCurrency(costPerUnit)}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56"
          >
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Cost</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatCurrency(effectiveCost)}
              </dd>
              <dt className="text-muted-foreground">Progress</dt>
              <dd className="text-right font-medium tabular-nums">
                {progressTotal > 0
                  ? `${progressCurrent} / ${progressTotal}`
                  : progressCurrent}
              </dd>
              {isUnstarted && (
                <dd className="col-span-2 text-xs text-muted-foreground">
                  Unstarted — no progress yet
                </dd>
              )}
            </dl>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    id: "go",
    enableSorting: false,
    header: () => <span className="sr-only">Go</span>,
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) =>
      row.original.resource.url
        ? (
          <Button
            asChild
            size="sm"
            variant="outline"
          >
            <a
              href={row.original.resource.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Go
              <ExternalLink />
            </a>
          </Button>
        )
        : (
          <span className="text-muted-foreground">—</span>
        ),
  },
];

export const providerColumns: ColumnDef<ProviderRow>[] = [
  {
    id: "name",
    sortDescFirst: false,
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Provider"
      />
    ),
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "font-medium whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <NameLink
        to="/providers/$id"
        id={row.original.provider.id}
        name={row.original.provider.name}
      />
    ),
  },
  {
    id: "costPerUnit",
    sortDescFirst: true,
    header: costPerUnitHeader,
    meta: costPerUnitMeta,
    cell: ({
      row,
    }) => {
      const {
        courseCount, completedUnits, totalUnits, cost, costPerUnit,
      }
        = row.original;
      return (
        <Popover>
          <PopoverTrigger
            className={cn(
              `
                cursor-pointer underline-offset-2
                hover:underline
              `,
              costPerUnit === null && "text-muted-foreground",
            )}
          >
            {costPerUnit === null ? "—" : formatCurrency(costPerUnit)}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56"
          >
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Courses</dt>
              <dd className="text-right font-medium tabular-nums">
                {courseCount}
              </dd>
              <dt className="text-muted-foreground">Completed Units</dt>
              <dd className="text-right font-medium tabular-nums">
                {completedUnits}
              </dd>
              <dt className="text-muted-foreground">Total Units</dt>
              <dd className="text-right font-medium tabular-nums">
                {totalUnits}
              </dd>
              <dt className="text-muted-foreground">Cost</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatCurrency(cost)}
              </dd>
              {costPerUnit === null && (
                <dd className="col-span-2 text-xs text-muted-foreground">
                  No course progress yet
                </dd>
              )}
            </dl>
          </PopoverContent>
        </Popover>
      );
    },
  },
];
