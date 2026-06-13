import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { CourseProvider } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import {
  Button,
  CardSettingsFlyout,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
} from "./-cardKit";

import { DataTable } from "@/components/ui/data-table";
import { fetchProviders, formatCurrency, parseCost } from "@/utils";

interface UnderutilizedProvider {
  provider: CourseProvider;
  cost: number;
  activeCount: number;
  inactiveCount: number;
  completeCount: number;
  amortization: number | null;
}

function buildUnderutilized(
  providers: CourseProvider[] | undefined,
): UnderutilizedProvider[] {
  if (!providers) return [];
  const rows: UnderutilizedProvider[] = [];
  for (const provider of providers) {
    const cost = parseCost(provider.cost);
    const activeCount = provider.activeCount ?? 0;
    if (cost <= 0 || activeCount > 0) continue;
    const completeCount = provider.completeCount ?? 0;
    rows.push({
      provider,
      cost,
      activeCount,
      inactiveCount: provider.inactiveCount ?? 0,
      completeCount,
      amortization: completeCount > 0 ? cost / completeCount : null,
    });
  }
  rows.sort((a, b) => {
    if (a.amortization === null && b.amortization === null) {
      return b.cost - a.cost;
    }
    if (a.amortization === null) return -1;
    if (b.amortization === null) return 1;
    return b.amortization - a.amortization;
  });
  return rows;
}

const columns: ColumnDef<UnderutilizedProvider>[] = [
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

export function DashboardUnderutilizedProviders({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const {
    data: providers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const rows = buildUnderutilized(providers);

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Underutilized Providers"
      action={
        <Link
          to="/providers"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      }
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
    >
      <DashboardSectionStatus
        isPending={isPending}
        error={error}
        isEmpty={!!providers && rows.length === 0}
        entity="providers"
        emptyMessage="No underutilized providers."
      />
      {rows.length > 0 && (
        <DataTable
          columns={columns}
          data={rows}
          getRowId={row => row.provider.id}
          className="w-auto min-w-full"
          containerClassName="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        />
      )}
    </DashboardCard>
  );
}
