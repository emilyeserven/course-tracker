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
import {
  DailyTrackerHeadColumns,
  DailyTrackerRow,
} from "@/components/dailies/DailyTrackerRow";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
    sortKey, sortDir, toggleSort, sortIndicator,
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
                          title="Sort by progress"
                        >
                          {sortIndicator("progress")}
                        </button>
                      </th>
                      <th className="p-2 font-medium">
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
                      <th className="p-2 font-medium whitespace-nowrap">
                        Type
                      </th>
                      <th className="p-2 font-medium whitespace-nowrap">
                        Cadence
                      </th>
                      <th className="p-2 font-medium whitespace-nowrap">
                        Streak
                      </th>
                      <th className="p-2 font-medium whitespace-nowrap">
                        Total
                      </th>
                      <th className="p-2 font-medium" />
                      <DailyTrackerHeadColumns
                        dayHeaders={dayHeaders}
                        statusThClassName="w-36 p-2 font-medium whitespace-nowrap"
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {activeDailies.map(daily => (
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
                          group border-t align-middle
                          hover:bg-muted/40
                        "
                        statusCellClassName="w-36 p-2"
                        firstConnectorClassName="
                          absolute top-1/2 right-[calc(50%+12px)]
                          -left-2 z-0 w-auto -translate-y-1/2
                        "
                        taskId={daily.taskId ?? daily.task?.id ?? null}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        )}

        {pausedDailies.length > 0 && (
          <DashboardCard title="Paused Routines">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-2 font-medium">Name</th>
                    <th className="p-2 font-medium whitespace-nowrap">
                      Last Entry
                    </th>
                    <th className="p-2 font-medium whitespace-nowrap">
                      Days Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pausedDailies.map((daily) => {
                    const lastEntry = getLastEntryDate(daily);
                    // Paused/completed rows share the name + last-entry cells but
                    // differ in their trailing stat columns.
                    // fallow-ignore-next-line code-duplication
                    const totalDays = getTotalCompletedDays(daily);
                    return (
                      <tr
                        key={daily.id}
                        className="border-t align-middle opacity-90"
                      >
                        <td className="p-2">
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
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {lastEntry ?? (
                            <span className="text-muted-foreground/70">—</span>
                          )}
                        </td>
                        <td className="p-2 whitespace-nowrap">{totalDays}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        {completedDailies.length > 0 && (
          <DashboardCard title="Completed Routines">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-2 font-medium">Name</th>
                    <th className="p-2 font-medium whitespace-nowrap">
                      Last Entry
                    </th>
                    <th className="p-2 font-medium whitespace-nowrap">
                      Longest Streak
                    </th>
                    <th className="p-2 font-medium whitespace-nowrap">
                      Days Completed
                    </th>
                    <th className="p-2 font-medium whitespace-nowrap">
                      Span (days)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {completedDailies.map((daily) => {
                    const lastEntry = getLastEntryDate(daily);
                    const longestStreak = getLongestStreak(daily);
                    const totalDays = getTotalCompletedDays(daily);
                    const spanDays = getDaysBetweenFirstAndLastEntry(daily);
                    return (
                      <tr
                        key={daily.id}
                        className="border-t align-middle opacity-90"
                      >
                        <td className="p-2">
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
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {lastEntry ?? (
                            <span className="text-muted-foreground/70">—</span>
                          )}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {longestStreak}
                        </td>
                        <td className="p-2 whitespace-nowrap">{totalDays}</td>
                        <td className="p-2 whitespace-nowrap">{spanDays}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
