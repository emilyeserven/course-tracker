import type { DashboardTileProps } from "@/lib/dashboardTiles";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { underutilizedColumns } from "./-underutilizedColumns";
import { buildUnderutilized } from "./-underutilizedRows";
import {
  CardSettingsFlyout,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
} from "../DashboardCard/-cardKit";

import { DataTable } from "@/components/ui/data-table";
import { fetchProviders } from "@/utils";

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
      action={(
        <Link
          to="/providers"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      )}
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
          columns={underutilizedColumns}
          data={rows}
          getRowId={row => row.provider.id}
          className="w-auto min-w-full"
          containerClassName="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        />
      )}
    </DashboardCard>
  );
}
