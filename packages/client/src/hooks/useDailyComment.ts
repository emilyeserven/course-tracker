import type { Daily } from "@emstack/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getTodayKey, upsertDaily, withCompletionNote } from "@/utils";

/**
 * Owns the today's-note read + save for a daily's comment popover: derives the
 * current note from today's completion and exposes a mutation that writes the
 * next note back through the daily upsert (invalidating the dailies caches on
 * success). The caller handles popover open/close via the mutate-call
 * `onSuccess`, which React Query runs after the cache invalidations settle.
 */
export function useDailyComment(daily: Daily) {
  const todayKey = getTodayKey();
  const queryClient = useQueryClient();
  const note
    = daily.completions.find(c => c.date === todayKey)?.note?.trim() || "";
  const hasNote = note.length > 0;

  const mutation = useMutation({
    mutationFn: (nextNote: string | null) => {
      const completions = withCompletionNote(daily, todayKey, nextNote);
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
        taskId: daily.taskId ?? daily.task?.id ?? null,
        status: daily.status ?? "active",
        criteria: daily.criteria ?? {},
      });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["daily", daily.id],
        }),
      ]),
    onError: () => {
      toast.error("Failed to save comment.");
    },
  });

  return {
    note,
    hasNote,
    mutation,
  };
}
