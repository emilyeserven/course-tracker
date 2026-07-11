import { useQuery } from "@tanstack/react-query";

import { useDailiesViewMode } from "@/hooks/useDailiesViewMode";
import {
  buildDailyDayHeaders,
  compareDailies,
  useDailySort,
  useDailyStatusMutation,
} from "@/hooks/useDailyTracker";
import { useMaxActiveDailies } from "@/stores/settingsStore";
import { fetchDailies, getTodayKey } from "@/utils";

/** Number of recent-day columns the active tracker table renders. */
const RECENT_DAYS_COUNT = 6;

/**
 * Bundled data layer for the routine tracker page: the dailies query,
 * view-mode + sort state, the status mutation, the active/paused/completed
 * buckets, and the recent-day headers. The page and its tables consume the
 * returned object; the route file stays presentational.
 */
export function useRoutineTracker() {
  const todayKey = getTodayKey();
  const maxActiveDailies = useMaxActiveDailies();
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

  const mutation = useDailyStatusMutation(todayKey);

  const baseSorted = dailies
    ? [...dailies].sort((a, b) =>
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
    recentDaysCount: RECENT_DAYS_COUNT,
  };
}

/** The bundle returned by {@link useRoutineTracker}, consumed by the tracker tables. */
export type RoutineTrackerState = ReturnType<typeof useRoutineTracker>;
