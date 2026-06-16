import type { DashboardDailiesData } from "./-useDashboardDailies";
import type { Daily, DailyTrackerColumnVisibility } from "@emstack/types";

import { RECENT_DAYS_COUNT } from "./-useDashboardDailies";

import {
  buildDailyTrackerColumns,
  DailiesActiveListView,
  DailyTrackerRow,
} from "@/components/dailies";
import { DataTable } from "@/components/ui/data-table";

/** Renders one dailies bucket as either the list view or the tracker table. */
export function DashboardDailiesBody({
  list,
  data,
  columns,
}: {
  list: Daily[];
  data: DashboardDailiesData;
  /** Per-tile column show/hide state from the card's settings menu. */
  columns?: DailyTrackerColumnVisibility;
}) {
  const {
    mode, mutation, dayHeaders, todayKey, sorting, onSortingChange,
  } = data;

  if (list.length === 0) return null;

  if (mode === "list") {
    return (
      <DailiesActiveListView
        dailies={list}
        todayKey={todayKey}
        mutationPending={mutation.isPending}
        recentDaysCount={RECENT_DAYS_COUNT}
        onChangeStatus={(daily, status, note) =>
          mutation.mutate({
            daily,
            status,
            note,
          })}
      />
    );
  }

  return (
    <DataTable
      columns={buildDailyTrackerColumns({
        dayHeaders,
        progressLabel: "Prog",
        statusHeadClassName: "p-2 font-medium whitespace-nowrap",
        titleHeadClassName: "w-full",
        columns,
      })}
      data={list}
      getRowId={daily => daily.id}
      enableSorting
      manualSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      className="border-collapse"
      renderRow={row => (
        <DailyTrackerRow
          daily={row.original}
          todayKey={todayKey}
          recentDaysCount={RECENT_DAYS_COUNT}
          mutationPending={mutation.isPending}
          onChangeStatus={(d, status, note) =>
            mutation.mutate({
              daily: d,
              status,
              note,
            })}
          rowClassName="
            group border-t
            hover:bg-muted/40
          "
          statusCellClassName="p-2"
          firstConnectorClassName="
            absolute top-1/2 right-[calc(50%+12px)] -left-2
            z-0 w-auto -translate-y-1/2
          "
          taskId={null}
          columns={columns}
        />
      )}
    />
  );
}
