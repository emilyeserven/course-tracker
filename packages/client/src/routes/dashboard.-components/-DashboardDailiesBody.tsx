import type { DashboardDailiesData } from "./-useDashboardDailies";
import type { Daily } from "@emstack/types";

import { RECENT_DAYS_COUNT } from "./-useDashboardDailies";

import { DailiesActiveListView } from "@/components/dailies";
import {
  DailyTrackerHeadColumns,
  DailyTrackerRow,
} from "@/components/dailies/DailyTrackerRow";

/** Renders one dailies bucket as either the list view or the tracker table. */
export function DashboardDailiesBody({
  list,
  data,
}: {
  list: Daily[];
  data: DashboardDailiesData;
}) {
  const {
    mode, mutation, dayHeaders, todayKey, toggleSort, sortIndicator,
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
