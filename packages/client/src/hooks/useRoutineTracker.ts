import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { useDailiesViewMode } from "@/hooks/useDailiesViewMode";
import {
  buildDailyDayHeaders,
  compareDailies,
  useDailySort,
  useDailyStatusMutation,
} from "@/hooks/useDailyTracker";
import { useSettings } from "@/hooks/useSettings";
import { fetchDailies, fetchResources, fetchTasks, getTodayKey } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/** Number of recent-day columns the active tracker table renders. */
const RECENT_DAYS_COUNT = 6;

/**
 * Bundled data layer for the routine tracker page: the dailies/tasks/resources
 * queries, the optional topic filter, view-mode + sort state, the status
 * mutation, the active/paused/completed buckets, and the recent-day headers.
 * The page and its tables consume the returned object; the route file stays
 * presentational.
 */
export function useRoutineTracker(filterTopicId: string | undefined) {
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

  return {
    maxActiveDailies: settings.maxActiveDailies,
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
    recentDaysCount: RECENT_DAYS_COUNT,
  };
}

/** The bundle returned by {@link useRoutineTracker}, consumed by the tracker tables. */
export type RoutineTrackerState = ReturnType<typeof useRoutineTracker>;
