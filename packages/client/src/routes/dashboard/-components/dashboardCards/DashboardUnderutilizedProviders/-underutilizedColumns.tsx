import type { UnderutilizedProvider } from "./-underutilizedRows";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { Button } from "../DashboardCard/-cardKit";

import { formatCurrency } from "@/utils";

export const underutilizedColumns: ColumnDef<UnderutilizedProvider>[] = [
  {
    id: "provider",
    header: "Provider",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "font-medium whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <Link
        to="/providers/$id"
        params={{
          id: row.original.provider.id,
        }}
        className="hover:text-blue-600"
      >
        {row.original.provider.name}
      </Link>
    ),
  },
  {
    id: "costPerUnit",
    header: "Cost per Unit",
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <span
        title={
          row.original.amortization === null
            ? "No completed courses yet"
            : undefined
        }
      >
        {row.original.amortization === null
          ? "—"
          : formatCurrency(row.original.amortization)}
      </span>
    ),
  },
  {
    id: "inactive",
    header: "Inactive",
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => row.original.inactiveCount,
  },
  {
    id: "complete",
    header: "Complete",
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => row.original.completeCount,
  },
  {
    id: "go",
    header: "Go",
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <a
          href={row.original.provider.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go
          <ExternalLink />
        </a>
      </Button>
    ),
  },
];
