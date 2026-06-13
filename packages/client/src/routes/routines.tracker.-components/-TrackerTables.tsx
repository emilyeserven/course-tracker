import type { RoutineTrackerState } from "@/hooks/useRoutineTracker";
import type { Daily } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";

import { DashboardCard } from "@/components/contentBoxComponents/DashboardCard";
import {
  buildDailyTrackerColumns,
  DailiesActiveListView,
  DailiesLimitSetting,
  DailiesViewModeToggle,
  DailyResourceIndicator,
  DailyTaskIndicator,
  DailyTitle,
  DailyTrackerRow,
  TooManyDailiesWarning,
} from "@/components/dailies";
import { DataTable } from "@/components/ui/data-table";
import {
  getDaysBetweenFirstAndLastEntry,
  getLastEntryDate,
  getLongestStreak,
  getTotalCompletedDays,
} from "@/utils";

/** Title link + resource/task indicators, shared by the paused & completed tables. */
function DailyNameCell({
  daily,
}: {
  daily: Daily;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Link
        to="/routines/$id"
        params={{
          id: daily.id,
        }}
        className="
          font-medium
          hover:text-blue-600
        "
      >
        <DailyTitle daily={daily} />
      </Link>
      <DailyResourceIndicator daily={daily} />
      <DailyTaskIndicator daily={daily} />
    </span>
  );
}

function lastEntryCell(daily: Daily) {
  return (
    getLastEntryDate(daily) ?? (
      <span className="text-muted-foreground/70">—</span>
    )
  );
}

// Columns shared between the Paused and Completed tracker tables.
const nameColumn: ColumnDef<Daily> = {
  id: "name",
  header: "Name",
  cell: ({
    row,
  }) => <DailyNameCell daily={row.original} />,
};

const lastEntryColumn: ColumnDef<Daily> = {
  id: "lastEntry",
  header: "Last Entry",
  meta: {
    headClassName: "whitespace-nowrap",
    cellClassName: "whitespace-nowrap",
  },
  cell: ({
    row,
  }) => lastEntryCell(row.original),
};

const daysCompletedColumn: ColumnDef<Daily> = {
  id: "daysCompleted",
  header: "Days Completed",
  meta: {
    headClassName: "whitespace-nowrap",
    cellClassName: "whitespace-nowrap",
  },
  cell: ({
    row,
  }) => getTotalCompletedDays(row.original),
};

const pausedColumns: ColumnDef<Daily>[] = [
  nameColumn,
  lastEntryColumn,
  daysCompletedColumn,
];

const completedColumns: ColumnDef<Daily>[] = [
  nameColumn,
  lastEntryColumn,
  {
    id: "longestStreak",
    header: "Longest Streak",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => getLongestStreak(row.original),
  },
  daysCompletedColumn,
  {
    id: "span",
    header: "Span (days)",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => getDaysBetweenFirstAndLastEntry(row.original),
  },
];

/**
 * Renders the routine tracker body: the empty state plus the Active (list /
 * table toggle), Paused, and Completed cards. Driven entirely by the bundle
 * from {@link useRoutineTracker}.
 */
export function TrackerTables({
  maxActiveDailies,
  mode,
  setMode,
  sorting,
  onSortingChange,
  mutation,
  baseSorted,
  activeDailies,
  pausedDailies,
  completedDailies,
  dayHeaders,
  todayKey,
  recentDaysCount,
}: RoutineTrackerState) {
  return (
    <div className="container flex flex-col gap-4">
      {(!baseSorted || baseSorted.length === 0) && (
        <p className="text-sm text-muted-foreground">
          <i>No routines yet!</i>
        </p>
      )}

      {activeDailies.length > 0 && (
        <DashboardCard
          title={
            <span className="inline-flex items-center gap-2">
              Active Routines
              <TooManyDailiesWarning
                activeCount={activeDailies.length}
                limit={maxActiveDailies}
                size="sm"
              />
            </span>
          }
          action={
            <>
              <DailiesViewModeToggle
                mode={mode}
                onChange={setMode}
              />
              <DailiesLimitSetting />
            </>
          }
        >
          {mode === "list" && (
            <DailiesActiveListView
              dailies={activeDailies}
              todayKey={todayKey}
              mutationPending={mutation.isPending}
              recentDaysCount={recentDaysCount}
              onChangeStatus={(daily, status, note) =>
                mutation.mutate({
                  daily,
                  status,
                  note,
                })}
            />
          )}
          {mode === "table" && (
            <DataTable
              columns={buildDailyTrackerColumns({
                dayHeaders,
                progressHideLabel: true,
                statusHeadClassName: "w-36 p-2 font-medium whitespace-nowrap",
              })}
              data={activeDailies}
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
                  recentDaysCount={recentDaysCount}
                  mutationPending={mutation.isPending}
                  onChangeStatus={(d, status) =>
                    mutation.mutate({
                      daily: d,
                      status,
                    })}
                  rowClassName="
                    group border-t align-middle
                    hover:bg-muted/40
                  "
                  statusCellClassName="w-36 p-2"
                  firstConnectorClassName="
                    absolute top-1/2 right-[calc(50%+12px)]
                    -left-2 z-0 w-auto -translate-y-1/2
                  "
                  taskId={row.original.taskId ?? row.original.task?.id ?? null}
                />
              )}
            />
          )}
        </DashboardCard>
      )}

      {pausedDailies.length > 0 && (
        <DashboardCard title="Paused Routines">
          <DataTable
            columns={pausedColumns}
            data={pausedDailies}
            getRowId={daily => daily.id}
            className="opacity-90"
          />
        </DashboardCard>
      )}

      {completedDailies.length > 0 && (
        <DashboardCard title="Completed Routines">
          <DataTable
            columns={completedColumns}
            data={completedDailies}
            getRowId={daily => daily.id}
            className="opacity-90"
          />
        </DashboardCard>
      )}
    </div>
  );
}
