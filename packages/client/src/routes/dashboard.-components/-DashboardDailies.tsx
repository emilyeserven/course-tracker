import type { Daily } from "@emstack/types";

import { useRef } from "react";

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
import { classifyDaily, fetchDailies, getTodayKey } from "@/utils";

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

  // Snapshot each routine's card the first time it's seen this mount, so
  // changing a status doesn't immediately move a row between cards. The split
  // only re-evaluates on reload/remount, when this ref starts empty again and
  // re-classifies the freshly fetched data. Row contents still render from live
  // query data, so a status change shows in place — only membership is frozen.
  const partitionRef = useRef<Map<string, "now" | "done">>(new Map());
  if (filtered) {
    for (const d of filtered) {
      if (!partitionRef.current.has(d.id)) {
        partitionRef.current.set(
          d.id,
          classifyDaily(d, todayKey, settings.weekTargetWindow),
        );
      }
    }
  }

  function bucket(name: "now" | "done"): Daily[] {
    return (filtered ?? [])
      .filter(d => partitionRef.current.get(d.id) === name)
      .sort((a, b) => compareDailies(a, b, sortKey, sortDir));
  }

  const doNow = bucket("now");
  const doneForDay = bucket("done");
  const hasData = !!filtered;
  const activeCount = filtered?.length ?? 0;

  const dayHeaders = buildDailyDayHeaders(filtered, RECENT_DAYS_COUNT, todayKey);

  function renderBody(list: Daily[]) {
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
            {list.map(daily => (
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
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DashboardCard
        title={
          <span className="inline-flex items-center gap-2">
            Do Now
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
          isEmpty={hasData && doNow.length === 0}
          entity="dailies"
          emptyMessage="Nothing to do right now."
        />
        {renderBody(doNow)}
      </DashboardCard>

      <DashboardCard title="Done for the Day">
        <DashboardSectionStatus
          isEmpty={hasData && doneForDay.length === 0}
          entity="dailies"
          emptyMessage="Nothing done yet today."
        />
        {renderBody(doneForDay)}
      </DashboardCard>
    </div>
  );
}
