import type { SortDirection } from "@/components/ui/manualSort";
import type { Daily, DailyCompletionStatus } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { makeManualSortHandler, toSortingState } from "@/components/ui/manualSort";
import {
  getDailyProgressPercent,
  getRecentDays,
  updateTodoStatus,
  upsertDaily,
  withCompletion,
  withCompletionNote,
} from "@/utils";

export type SortKey = "name" | "progress";

/** Render a `MM/DD` label for a `YYYY-MM-DD` date key, in UTC. */
function formatMmDd(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Comparator for the active-dailies table: by progress (when sorting on
 * progress) then by action-label/name, honoring the current sort direction.
 */
export function compareDailies(
  a: Daily,
  b: Daily,
  sortKey: SortKey,
  sortDir: SortDirection,
): number {
  if (sortKey === "progress") {
    const diff = getDailyProgressPercent(a) - getDailyProgressPercent(b);
    if (diff !== 0) return sortDir === "asc" ? diff : -diff;
  }
  const cmp = (a.actionLabel ?? a.name).localeCompare(
    b.actionLabel ?? b.name,
    undefined,
    {
      sensitivity: "base",
    },
  );
  return sortKey === "name" && sortDir === "desc" ? -cmp : cmp;
}

/**
 * Sort state for the tracker tables, exposed as a TanStack `SortingState` plus a
 * change handler so the tables can drive `DataTable` / `DataTableColumnHeader`.
 * `sortKey`/`sortDir` remain for `compareDailies`.
 */
export function useDailySort() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const sorting = toSortingState(sortKey, sortDir);
  const onSortingChange = makeManualSortHandler(sorting, (id, dir) => {
    setSortKey(id as SortKey);
    setSortDir(dir);
  });

  return {
    sortKey,
    sortDir,
    sorting,
    onSortingChange,
  };
}

/** Mutation that persists a status (and optional note) change for a daily on `todayKey`. */
export function useDailyStatusMutation(todayKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      daily,
      status,
      note,
    }: {
      daily: Daily;
      status: DailyCompletionStatus;
      note?: string | null;
    }) => {
      // Todo-backed rows (Task List todos due today) write their status straight
      // back to the todo rather than a routine's completions.
      if (daily.kind === "todo" && daily.taskId && daily.todoId) {
        return updateTodoStatus(daily.taskId, daily.todoId, status);
      }
      // Re-updating today's status re-bakes the entry to the current schedule.
      const withStatus = withCompletion(daily, todayKey, status, todayKey);
      const completions
        = note === undefined
          ? withStatus
          : withCompletionNote(
            {
              ...daily,
              completions: withStatus,
            },
            todayKey,
            note,
          );
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
        courseProviderId: daily.provider?.id ?? null,
        resourceId: daily.resource?.id ?? null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
    },
    onError: () => {
      toast.error("Failed to update daily.");
    },
  });
}

export interface DailyDayHeader {
  dateKey: string;
  label: string;
  isToday: boolean;
}

/**
 * The recent-day column headers (most recent first, excluding the leading
 * padding day) derived from the first daily in the table.
 */
export function buildDailyDayHeaders(
  dailies: Daily[] | undefined,
  recentDaysCount: number,
  todayKey: string,
): DailyDayHeader[] {
  if (!dailies || dailies.length === 0) return [];
  return getRecentDays(dailies[0], recentDaysCount + 1, todayKey, "mmdd")
    .slice(0, -1)
    .reverse()
    .map(d => ({
      dateKey: d.dateKey,
      label: formatMmDd(d.dateKey),
      isToday: d.isToday,
    }));
}
