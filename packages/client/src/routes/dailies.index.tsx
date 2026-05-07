import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FlameIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  DailyLocationCell,
  DailyStatusCircle,
  DailyStatusConnector,
  TodayStatusCell,
} from "@/components/dailies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchDailies,
  findStatusForDate,
  getCurrentChain,
  getRecentDays,
  getTodayKey,
  upsertDaily,
  withCompletion,
} from "@/utils";

export const Route = createFileRoute("/dailies/")({
  component: Dailies,
  errorComponent: DailiesError,
  pendingComponent: DailiesPending,
});

const RECENT_DAYS_COUNT = 6;

function DailiesPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your dailies...</h1>
    </div>
  );
}

function DailiesError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your dailies.</h1>
    </div>
  );
}

function formatMmDd(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
}

function Dailies() {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();

  const {
    data: dailies,
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
    <div>
      <PageHeader
        pageTitle="Dailies"
        pageSection=""
      />
      <div className="container flex flex-col gap-4">
        <div className="flex justify-end">
          <Link
            to="/dailies/$id/edit"
            params={{
              id: "new",
            }}
          >
            <Button variant="outline">
              <PlusIcon className="size-4" />
              Add Daily
            </Button>
          </Link>
        </div>

        {(!sortedDailies || sortedDailies.length === 0) && (
          <p className="text-sm text-muted-foreground">
            <i>No dailies yet!</i>
          </p>
        )}

        {sortedDailies && sortedDailies.length > 0 && (
          <DashboardCard title="All Dailies">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-2 font-medium">Title</th>
                    <th className="p-2 font-medium">Description</th>
                    <th className="p-2 font-medium">Streak</th>
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
                        <td className="p-2 align-top">
                          <Link
                            to="/dailies/$id"
                            from="/dailies"
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
                        </td>
                        <td className="max-w-xs p-2 align-top">
                          {daily.description
                            ? (
                              <span
                                className="block truncate text-muted-foreground"
                                title={daily.description}
                              >
                                {daily.description}
                              </span>
                            )
                            : (
                              <span className="text-muted-foreground/60">
                                <i>No description</i>
                              </span>
                            )}
                        </td>
                        <td className="p-2 align-top">
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
                        {days.map((day, i) => (
                          <td
                            key={day.dateKey}
                            className="relative px-1 py-2 align-top"
                          >
                            {i > 0 && (
                              <DailyStatusConnector
                                left={days[i - 1].status}
                                right={day.status}
                                className="
                                  absolute top-5 -left-1 z-0 w-3
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
                        ))}
                        <td className="p-2 align-top">
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
                        <td className="p-2 align-top">
                          <DailyLocationCell location={daily.location} />
                        </td>
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
