import type { Daily } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  DailiesActiveListView,
  DailiesLimitSetting,
  DailiesViewModeToggle,
  DailyResourceIndicator,
  DailyTaskIndicator,
  DailyTitle,
  TooManyDailiesWarning,
} from "@/components/dailies";
import { buildDailyTrackerColumns } from "@/components/dailies/dailyTrackerColumns";
import { DailyTrackerRow } from "@/components/dailies/DailyTrackerRow";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useDailiesViewMode } from "@/hooks/useDailiesViewMode";
import {
  buildDailyDayHeaders,
  compareDailies,
  useDailySort,
  useDailyStatusMutation,
} from "@/hooks/useDailyTracker";
import { useSettings } from "@/hooks/useSettings";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import {
  fetchResources,
  fetchDailies,
  fetchTasks,
  getDaysBetweenFirstAndLastEntry,
  getLastEntryDate,
  getLongestStreak,
  getTodayKey,
  getTotalCompletedDays,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export interface TrackerSearch {
  topicId?: string;
}

export const Route = createFileRoute("/routines/tracker")({
  component: DailyTracker,
  errorComponent: TrackerError,
  pendingComponent: TrackerPending,
  validateSearch: (search: Record<string, unknown>): TrackerSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

const RECENT_DAYS_COUNT = 6;

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

const pausedColumns: ColumnDef<Daily>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({
      row,
    }) => <DailyNameCell daily={row.original} />,
  },
  {
    id: "lastEntry",
    header: "Last Entry",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => lastEntryCell(row.original),
  },
  {
    id: "daysCompleted",
    header: "Days Completed",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => getTotalCompletedDays(row.original),
  },
];

const completedColumns: ColumnDef<Daily>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({
      row,
    }) => <DailyNameCell daily={row.original} />,
  },
  {
    id: "lastEntry",
    header: "Last Entry",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => lastEntryCell(row.original),
  },
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
  {
    id: "daysCompleted",
    header: "Days Completed",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => getTotalCompletedDays(row.original),
  },
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

function TrackerPending() {
  return <EntityPending entity="dailies" />;
}

function TrackerError() {
  return <EntityError entity="dailies" />;
}

function DailyTracker() {
  const urlSearch = Route.useSearch();
  const filterTopicId = urlSearch.topicId;
  const todayKey = getTodayKey();
  const {
    settings,
  } = useSettings();
  const {
    mode, setMode,
  } = useDailiesViewMode();
  const {
    sortKey, sortDir, sorting, onSortingChange,
  } = useDailySort();

  const {
    data: dailies,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  const {
    data: tasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
    enabled: !!filterTopicId,
  });

  const {
    data: courses,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
    enabled: !!filterTopicId,
  });

  const topicMatchedTaskIds = useMemo(() => {
    if (!filterTopicId || !tasks) return null;
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.topicId === filterTopicId) set.add(t.id);
    });
    return set;
  }, [filterTopicId, tasks]);

  const topicMatchedCourseIds = useMemo(() => {
    if (!filterTopicId || !courses) return null;
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.topics?.some(t => t.id === filterTopicId)) set.add(c.id);
    });
    return set;
  }, [filterTopicId, courses]);

  const topicFilteredDailies = useMemo(() => {
    if (!dailies) return undefined;
    if (!filterTopicId) return dailies;
    if (!topicMatchedTaskIds || !topicMatchedCourseIds) return undefined;
    return dailies.filter((d) => {
      const taskHit = d.taskId
        ? topicMatchedTaskIds.has(d.taskId)
        : d.task?.id
          ? topicMatchedTaskIds.has(d.task.id)
          : false;
      const courseHit = d.resource?.id
        ? topicMatchedCourseIds.has(d.resource.id)
        : false;
      return taskHit || courseHit;
    });
  }, [dailies, filterTopicId, topicMatchedTaskIds, topicMatchedCourseIds]);

  const mutation = useDailyStatusMutation(todayKey);

  const baseSorted = topicFilteredDailies
    ? [...topicFilteredDailies].sort((a, b) =>
      (a.actionLabel ?? a.name).localeCompare(
        b.actionLabel ?? b.name,
        undefined,
        {
          sensitivity: "base",
        },
      ))
    : undefined;

  const activeDailies = (
    baseSorted?.filter(
      d => d.status !== "complete" && d.status !== "paused",
    ) ?? []
  )
    .slice()
    .sort((a, b) => compareDailies(a, b, sortKey, sortDir));
  const pausedDailies = baseSorted?.filter(d => d.status === "paused") ?? [];
  const completedDailies
    = baseSorted?.filter(d => d.status === "complete") ?? [];

  const dayHeaders = buildDailyDayHeaders(
    activeDailies,
    RECENT_DAYS_COUNT,
    todayKey,
  );

  return (
    <div>
      <PageHeader
        pageTitle="Routine Tracker"
        pageSection="routines"
        description={ENTITY_DESCRIPTIONS.dailies}
      >
        <Link
          to="/routines/$id/edit"
          params={{
            id: "new",
          }}
          search={{
            mode: "daily",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Daily
          </Button>
        </Link>
      </PageHeader>
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
                <DailiesLimitSetting />
              </>
            }
          >
            {mode === "list" && (
              <DailiesActiveListView
                dailies={activeDailies}
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
                    recentDaysCount={RECENT_DAYS_COUNT}
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
    </div>
  );
}
