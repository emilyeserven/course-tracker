import type { Daily } from "@emstack/types";

import { useRef } from "react";

import { useQuery } from "@tanstack/react-query";

import { useDailiesViewMode } from "@/hooks/useDailiesViewMode";
import {
  buildDailyDayHeaders,
  compareDailies,
  useDailySort,
  useDailyStatusMutation,
} from "@/hooks/useDailyTracker";
import {
  useMaxActiveDailies,
  useWeekTargetWindow,
} from "@/stores/settingsStore";
import { classifyDaily, fetchDailies, fetchTaskDailies, getTodayKey } from "@/utils";

export const RECENT_DAYS_COUNT = 6;

/**
 * Shared data + handlers for the Do Now / Done for the Day cards. Both cards
 * call this; React Query dedupes the underlying `dailies` request. Each caller
 * gets its own frozen partition (see below), but the classification is
 * deterministic so the two cards agree on which routine belongs where.
 */
export function useDashboardDailies() {
  const todayKey = getTodayKey();
  const maxActiveDailies = useMaxActiveDailies();
  const weekTargetWindow = useWeekTargetWindow();
  const {
    mode, setMode,
  } = useDailiesViewMode();
  const {
    sortKey, sortDir, sorting, onSortingChange,
  } = useDailySort();

  const {
    data: dailies,
    isPending,
    error,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  // Task List todos due today (or overdue) projected into the Daily shape, so
  // they share the Do Now / Done-for-the-Day tracker with routines. Keyed by the
  // same ["dailies"] mutations invalidate, refetched alongside.
  const {
    data: todoDailies,
  } = useQuery({
    queryKey: ["dailies", "todos"],
    queryFn: () => fetchTaskDailies(),
  });

  const mutation = useDailyStatusMutation(todayKey);

  const combined
    = dailies || todoDailies
      ? [...(dailies ?? []), ...(todoDailies ?? [])]
      : undefined;

  const filtered = combined
    ? combined.filter(d => d.status !== "complete" && d.status !== "paused")
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
          classifyDaily(d, todayKey, weekTargetWindow),
        );
      }
    }
  }

  function bucket(name: "now" | "done"): Daily[] {
    return (filtered ?? [])
      .filter(d => partitionRef.current.get(d.id) === name)
      .sort((a, b) => compareDailies(a, b, sortKey, sortDir));
  }

  return {
    bucket,
    isPending,
    error,
    hasData: !!filtered,
    activeCount: filtered?.length ?? 0,
    dayHeaders: buildDailyDayHeaders(filtered, RECENT_DAYS_COUNT, todayKey),
    todayKey,
    mode,
    setMode,
    sorting,
    onSortingChange,
    mutation,
    maxActiveDailies,
  };
}

export type DashboardDailiesData = ReturnType<typeof useDashboardDailies>;
