import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FlameIcon, LaughIcon } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  DailyCourseIndicator,
  DailyLocationCell,
  DailyStatusCircle,
  DailyStatusConnector,
  TodayStatusCell,
} from "@/components/dailies";
import { cn } from "@/lib/utils";
import {
  fetchDailies,
  findStatusForDate,
  getCurrentChain,
  getRecentDays,
  getTodayKey,
  getTotalCompletedDays,
  upsertDaily,
  withCompletion,
} from "@/utils";

const RECENT_DAYS_COUNT = 6;

function formatMmDd(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
}

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
        courseId: daily.course?.id ?? null,
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

  const sortedDailies = dailies
    ? [...dailies].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      }))
    : undefined;

  const dayHeaders = sortedDailies && sortedDailies.length > 0
    ? getRecentDays(
      sortedDailies[0],
      RECENT_DAYS_COUNT + 1,
      todayKey,
      "mmdd",
    )
      .slice(0, -1)
      .map(d => ({
        dateKey: d.dateKey,
        label: formatMmDd(d.dateKey),
        isToday: d.isToday,
      }))
    : [];

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
      {sortedDailies && sortedDailies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No dailies yet.</i>
        </p>
      )}
      {sortedDailies && sortedDailies.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="p-2 font-medium">Title</th>
                <th className="p-2 font-medium">Streak</th>
                <th className="p-2 font-medium">Total</th>
                {dayHeaders.map(d => (
                  <th
                    key={d.dateKey}
                    className={cn(
                      "px-1 py-2 text-center font-medium",
                      d.isToday && "text-foreground",
                    )}
                  >
                    {d.label}
                  </th>
                ))}
                <th className="p-2 font-medium">Today&apos;s Status</th>
                <th className="p-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {sortedDailies.map((daily) => {
                const currentStatus = findStatusForDate(daily, todayKey);
                const chain = getCurrentChain(daily, todayKey);
                const total = getTotalCompletedDays(daily);
                const days = getRecentDays(
                  daily,
                  RECENT_DAYS_COUNT + 1,
                  todayKey,
                  "mmdd",
                ).slice(0, -1);
                return (
                  <tr
                    key={daily.id}
                    className="
                      group border-t
                      hover:bg-muted/40
                    "
                  >
                    <td className="p-2">
                      <span className="inline-flex items-center gap-1.5">
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
                        <DailyCourseIndicator daily={daily} />
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          chain > 0
                            ? "text-orange-600"
                            : "text-muted-foreground",
                        )}
                        title={
                          chain > 0
                            ? `${chain}-day chain`
                            : "No active chain"
                        }
                      >
                        <FlameIcon className="size-3.5" />
                        {chain}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          total > 0
                            ? "text-emerald-600"
                            : "text-muted-foreground",
                        )}
                        title={`${total} total day${total === 1 ? "" : "s"} completed`}
                      >
                        <LaughIcon className="size-3.5" />
                        {total}
                      </span>
                    </td>
                    {days.map((day, i) => {
                      const isLast = i === days.length - 1;
                      const linkToToday
                        = isLast
                          && day.status
                          && day.status !== "incomplete"
                          && currentStatus
                          && currentStatus !== "incomplete";
                      return (
                        <td
                          key={day.dateKey}
                          className="relative px-1 py-2"
                        >
                          {i > 0 && (
                            <DailyStatusConnector
                              left={days[i - 1].status}
                              right={day.status}
                              className="
                                absolute top-5 right-[calc(50%+12px)]
                                left-[calc(-50%+12px)] z-0 w-auto
                                -translate-y-1/2
                              "
                            />
                          )}
                          {linkToToday && (
                            <DailyStatusConnector
                              left={day.status}
                              right={currentStatus}
                              className="
                                absolute top-5 left-[calc(50%+12px)] z-0 w-3
                                -translate-y-1/2
                              "
                            />
                          )}
                          <div className="relative z-10 flex justify-center">
                            <DailyStatusCircle
                              status={day.status}
                              size="sm"
                              title={`${day.dateKey}${day.status ? ` — ${day.status}` : " — no entry"}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2">
                      <TodayStatusCell
                        daily={daily}
                        currentStatus={currentStatus}
                        disabled={mutation.isPending}
                        onChange={status => mutation.mutate({
                          daily,
                          status,
                        })}
                      />
                    </td>
                    <td className="p-2">
                      <DailyLocationCell location={daily.location} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
