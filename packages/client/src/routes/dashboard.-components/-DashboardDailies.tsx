import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FlameIcon } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  DailyRecentDaysStrip,
  DailyStatusButtons,
} from "@/components/dailies";
import { cn } from "@/lib/utils";
import {
  fetchDailies,
  findStatusForDate,
  getCurrentChain,
  getTodayKey,
  upsertDaily,
  withCompletion,
} from "@/utils";

export function DashboardDailies() {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();

  const {
    data: dailies, isPending, error,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  const mutation = useMutation({
    mutationFn: ({
      daily, status,
    }: { daily: Daily;
      status: DailyCompletionStatus; }) => {
      const completions = withCompletion(daily, todayKey, status);
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
        courseProviderId: daily.provider?.id ?? null,
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

  return (
    <DashboardCard
      title="Dailies"
      action={(
        <Link
          to="/dailies"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      )}
    >
      {isPending && (
        <p className="text-sm text-muted-foreground">Loading dailies...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load dailies.</p>
      )}
      {dailies && dailies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No dailies yet.</i>
        </p>
      )}
      {dailies && dailies.length > 0 && (
        <ul className="flex flex-col divide-y">
          {dailies.map((daily) => {
            const currentStatus = findStatusForDate(daily, todayKey);
            const chain = getCurrentChain(daily, todayKey);
            return (
              <li
                key={daily.id}
                className="flex flex-col gap-3 py-3"
              >
                <div
                  className="flex flex-row items-center justify-between gap-2"
                >
                  <Link
                    to="/dailies/$id"
                    params={{
                      id: daily.id,
                    }}
                    className="
                      font-medium
                      hover:text-blue-600
                    "
                  >
                    {daily.name}
                  </Link>
                  <div className="flex flex-row items-center gap-2">
                    <span
                      className={cn("inline-flex items-center gap-1 text-xs", chain > 0
                        ? "text-orange-600"
                        : "text-muted-foreground")}
                      title={
                        chain > 0
                          ? `${chain}-day chain`
                          : "No active chain"
                      }
                    >
                      <FlameIcon className="size-3.5" />
                      {chain}
                    </span>
                    {daily.provider && (
                      <span className="text-xs text-muted-foreground">
                        {daily.provider.name}
                      </span>
                    )}
                  </div>
                </div>
                <DailyRecentDaysStrip
                  daily={daily}
                  labelFormat="mmdd"
                />
                <DailyStatusButtons
                  currentStatus={currentStatus}
                  disabled={mutation.isPending}
                  onChange={status => mutation.mutate({
                    daily,
                    status,
                  })}
                />
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
