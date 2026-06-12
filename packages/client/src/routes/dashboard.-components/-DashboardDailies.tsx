import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  DashboardCard,
  DashboardSectionStatus,
} from "@/components/boxes/DashboardCard";
import {
  DailiesActiveListView,
  DailiesViewModeToggle,
  TooManyDailiesWarning,
} from "@/components/dailies";
import {
  DailyTrackerHeadColumns,
  DailyTrackerRow,
} from "@/components/dailies/DailyTrackerRow";
import { useDailiesViewMode } from "@/hooks/useDailiesViewMode";
import {
  buildDailyDayHeaders,
  compareDailies,
  useDailySort,
  useDailyStatusMutation,
} from "@/hooks/useDailyTracker";
import { useSettings } from "@/hooks/useSettings";
import { fetchDailies, getTodayKey } from "@/utils";

const RECENT_DAYS_COUNT = 6;

export function DashboardDailies() {
  const todayKey = getTodayKey();
  const {
    settings,
  } = useSettings();
  const {
    mode, setMode,
  } = useDailiesViewMode();
  const {
    sortKey, sortDir, toggleSort, sortIndicator,
  } = useDailySort();

  const {
    data: dailies,
    isPending,
    error,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  const mutation = useDailyStatusMutation(todayKey);

  const filtered = dailies
    ? dailies.filter(d => d.status !== "complete" && d.status !== "paused")
    : undefined;

  const sortedDailies = filtered
    ? [...filtered].sort((a, b) => compareDailies(a, b, sortKey, sortDir))
    : undefined;
  const activeCount = sortedDailies?.length ?? 0;

  const dayHeaders = buildDailyDayHeaders(
    sortedDailies,
    RECENT_DAYS_COUNT,
    todayKey,
  );

  return (
    <DashboardCard
      title={
        <span className="inline-flex items-center gap-2">
          Routines
          <TooManyDailiesWarning
            activeCount={activeCount}
            limit={settings.maxActiveDailies}
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
          <Link
            to="/routines/tracker"
            className="
              text-sm text-primary underline-offset-2
              hover:underline
            "
          >
            View all
          </Link>
        </>
      }
    >
      <DashboardSectionStatus
        isPending={isPending}
        error={error}
        isEmpty={!!sortedDailies && sortedDailies.length === 0}
        entity="dailies"
        emptyMessage="No dailies yet."
      />
      {sortedDailies && sortedDailies.length > 0 && mode === "list" && (
        <DailiesActiveListView
          dailies={sortedDailies}
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
      )}
      {sortedDailies && sortedDailies.length > 0 && mode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="p-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("progress")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                    aria-label="Sort by progress"
                  >
                    Progress
                    {sortIndicator("progress")}
                  </button>
                </th>
                <th className="w-full p-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                    aria-label="Sort by title"
                  >
                    Title
                    {sortIndicator("name")}
                  </button>
                </th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium">Cadence</th>
                <th className="p-2 font-medium">Streak</th>
                <th className="p-2 font-medium">Total</th>
                <th className="p-2 font-medium" />
                <DailyTrackerHeadColumns
                  dayHeaders={dayHeaders}
                  statusThClassName="p-2 font-medium whitespace-nowrap"
                />
              </tr>
            </thead>
            <tbody>
              {sortedDailies.map(daily => (
                <DailyTrackerRow
                  key={daily.id}
                  daily={daily}
                  todayKey={todayKey}
                  recentDaysCount={RECENT_DAYS_COUNT}
                  mutationPending={mutation.isPending}
                  onChangeStatus={(d, status) =>
                    mutation.mutate({
                      daily: d,
                      status,
                    })}
                  rowClassName="
                    group border-t
                    hover:bg-muted/40
                  "
                  statusCellClassName="p-2"
                  firstConnectorClassName="
                    absolute top-1/2 right-[calc(50%+12px)] -left-2
                    z-0 -translate-y-1/2
                  "
                  taskId={null}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
