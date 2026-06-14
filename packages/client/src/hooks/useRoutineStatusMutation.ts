import type { Daily, DailyCompletionStatus } from "@emstack/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getTodayKey,
  upsertRoutine,
  withCompletion,
  withCompletionNote,
} from "@/utils";

/**
 * Marks today's completion status (incomplete/touched/goal/exceeded/freeze) for
 * a routine — the same daily-status concept the dashboard table edits. Sends a
 * partial body (name + completions), so the upsert preserves the routine's
 * weekly grid, connections, criteria and overall status.
 *
 * Distinct from `useDailyStatusMutation` (which calls `upsertDaily`): this one
 * targets the routine endpoint and invalidates the routine/routines/dailies
 * caches together.
 */
export function useRoutineStatusMutation(id: string) {
  const queryClient = useQueryClient();
  const todayDateKey = getTodayKey();

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
      // Re-updating today's status re-bakes the entry to the current schedule.
      const withStatus = withCompletion(daily, todayDateKey, status, todayDateKey);
      const completions
        = note === undefined
          ? withStatus
          : withCompletionNote(
            {
              ...daily,
              completions: withStatus,
            },
            todayDateKey,
            note,
          );
      return upsertRoutine(daily.id, {
        name: daily.name,
        completions,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["routine", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
      toast.success("Status updated.");
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });
}
