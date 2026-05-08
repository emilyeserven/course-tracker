import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FlameIcon,
  LaughIcon,
  PlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  DailiesLimitSetting,
  DailyCourseIndicator,
  DailyLocationCell,
  DailyProgressCell,
  DailyStatusCircle,
  DailyStatusConnector,
  DailyTaskIndicator,
  TodayStatusCell,
  TooManyDailiesWarning,
} from "@/components/dailies";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import {
  fetchDailies,
  findStatusForDate,
  getCurrentChain,
  getDaysBetweenFirstAndLastEntry,
  getLastEntryDate,
  getLongestStreak,
  getRecentDays,
  getTodayKey,
  getTotalCompletedDays,
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
  return <EntityPending entity="dailies" />;
}

function DailiesError() {
  return <EntityError entity="dailies" />;
}

function formatMmDd(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
}

function Dailies() {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const {
    settings,
  } = useSettings();

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

  const activeDailies = sortedDailies?.filter(
    d => d.status !== "complete" && d.status !== "paused",
  ) ?? [];
  const pausedDailies = sortedDailies?.filter(d => d.status === "paused") ?? [];
  const completedDailies = sortedDailies?.filter(d => d.status === "complete")
    ?? [];

  const dayHeaders = activeDailies.length > 0
    ? getRecentDays(
      activeDailies[0],
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
      >
        <Link
          to="/dailies/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Daily
          </Button>
        </Link>
      </PageHeader>
      <div className="container flex flex-col gap-4">

        {(!sortedDailies || sortedDailies.length === 0) && (
          <p className="text-sm text-muted-foreground">
            <i>No dailies yet!</i>
          </p>
        )}

        {activeDailies.length > 0 && (
          <DashboardCard
            title={(
              <span className="inline-flex items-center gap-2">
                Active Dailies
                <TooManyDailiesWarning
                  activeCount={activeDailies.length}
                  limit={settings.maxActiveDailies}
                  size="sm"
                />
              </span>
            )}
            action={<DailiesLimitSetting />}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-2 font-medium">Title</th>
                    <th className="p-2 font-medium">Progress</th>
                    <th className="p-2 font-medium">Description</th>
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
                    <th className="p-2 font-medium whitespace-nowrap">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeDailies.map((daily) => {
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
                          group border-t align-middle
                          hover:bg-muted/40
                        "
                      >
                        <td className="p-2">
                          <span className="inline-flex items-center gap-1.5">
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
                            <DailyCourseIndicator daily={daily} />
                            <DailyTaskIndicator daily={daily} />
                          </span>
                        </td>
                        <td className="p-2">
                          <DailyProgressCell daily={daily} />
                        </td>
                        <td className="max-w-xs p-2">
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
                              className="relative px-1 py-2 align-middle"
                            >
                              {i > 0 && (
                                <DailyStatusConnector
                                  left={days[i - 1].status}
                                  right={day.status}
                                  className="
                                    absolute top-1/2 right-[calc(50%+12px)]
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
                                    absolute top-1/2 -right-2
                                    left-[calc(50%+12px)] z-0 w-auto
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
                        <td className="p-2 whitespace-nowrap">
                          <DailyLocationCell
                            location={daily.location}
                            taskId={daily.taskId ?? daily.task?.id ?? null}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        {pausedDailies.length > 0 && (
          <DashboardCard title="Paused Dailies">
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
                    const totalDays = getTotalCompletedDays(daily);
                    return (
                      <tr
                        key={daily.id}
                        className="border-t align-middle opacity-90"
                      >
                        <td className="p-2">
                          <span className="inline-flex items-center gap-1.5">
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
                            <DailyCourseIndicator daily={daily} />
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
          <DashboardCard title="Completed Dailies">
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
                            <DailyCourseIndicator daily={daily} />
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
