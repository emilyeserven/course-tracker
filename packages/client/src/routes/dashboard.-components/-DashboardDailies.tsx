import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  FlameIcon,
  LaughIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  DailiesActiveListView,
  DailiesViewModeToggle,
  DailyCommentPopover,
  DailyCourseIndicator,
  DailyLocationCell,
  DailyProgressCell,
  DailyStatusCircle,
  DailyStatusConnector,
  DailyTaskIndicator,
  TodayStatusCell,
  TooManyDailiesWarning,
} from "@/components/dailies";
import { useDailiesViewMode } from "@/hooks/useDailiesViewMode";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import {
  fetchDailies,
  findStatusForDate,
  getCurrentChain,
  getDailyProgressPercent,
  getRecentDays,
  getTodayKey,
  getTotalCompletedDays,
  upsertDaily,
  withCompletion,
  withCompletionNote,
} from "@/utils";

const RECENT_DAYS_COUNT = 6;

function formatMmDd(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
}

type SortKey = "name" | "progress";
type SortDir = "asc" | "desc";

export function DashboardDailies() {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const { settings } = useSettings();
  const { mode, setMode } = useDailiesViewMode();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const {
    data: dailies,
    isPending,
    error,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  const mutation = useMutation({
    mutationFn: ({
      daily,
      status,
      note,
    }: {
      daily: Daily;
      status: DailyCompletionStatus;
      note?: string | null;
    }) => {
      const withStatus = withCompletion(daily, todayKey, status);
      const completions =
        note === undefined
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
        courseId: daily.resource?.id ?? null,
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

  const filtered = dailies
    ? dailies.filter((d) => d.status !== "complete" && d.status !== "paused")
    : undefined;

  const sortedDailies = filtered
    ? [...filtered].sort((a, b) => {
        if (sortKey === "progress") {
          const diff = getDailyProgressPercent(a) - getDailyProgressPercent(b);
          if (diff !== 0) return sortDir === "asc" ? diff : -diff;
        }
        const cmp = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
        return sortKey === "name" && sortDir === "desc" ? -cmp : cmp;
      })
    : undefined;
  const activeCount = sortedDailies?.length ?? 0;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "progress" ? "desc" : "asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) {
      return <ArrowUpDownIcon className="size-3 opacity-40" />;
    }
    return sortDir === "asc" ? (
      <ArrowUpIcon className="size-3" />
    ) : (
      <ArrowDownIcon className="size-3" />
    );
  }

  const dayHeaders =
    sortedDailies && sortedDailies.length > 0
      ? getRecentDays(sortedDailies[0], RECENT_DAYS_COUNT + 1, todayKey, "mmdd")
          .slice(0, -1)
          .reverse()
          .map((d) => ({
            dateKey: d.dateKey,
            label: formatMmDd(d.dateKey),
            isToday: d.isToday,
          }))
      : [];

  return (
    <DashboardCard
      title={
        <span className="inline-flex items-center gap-2">
          Dailies
          <TooManyDailiesWarning
            activeCount={activeCount}
            limit={settings.maxActiveDailies}
            size="sm"
          />
        </span>
      }
      action={
        <>
          <DailiesViewModeToggle mode={mode} onChange={setMode} />
          <Link
            to="/dailies"
            className="
              text-sm text-primary underline-offset-2
              hover:underline
            "
          >
            View all
          </Link>
        </>
      }
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
      {sortedDailies && sortedDailies.length > 0 && mode === "list" && (
        <DailiesActiveListView
          dailies={sortedDailies}
          todayKey={todayKey}
          mutationPending={mutation.isPending}
          recentDaysCount={RECENT_DAYS_COUNT}
          onChangeStatus={(daily, status, note) =>
            mutation.mutate({
              daily,
              status,
              note,
            })
          }
        />
      )}
      {sortedDailies && sortedDailies.length > 0 && mode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="p-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("progress")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                    aria-label="Sort by progress"
                  >
                    Progress
                    {sortIndicator("progress")}
                  </button>
                </th>
                <th className="w-full p-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                    aria-label="Sort by title"
                  >
                    Title
                    {sortIndicator("name")}
                  </button>
                </th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium">Streak</th>
                <th className="p-2 font-medium">Total</th>
                <th className="p-2 font-medium" />
                <th className="p-2 font-medium whitespace-nowrap">
                  Today&apos;s Status
                </th>
                {dayHeaders.map((d) => (
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
                <th className="p-2 font-medium whitespace-nowrap">Location</th>
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
                )
                  .slice(0, -1)
                  .reverse();
                return (
                  <tr
                    key={daily.id}
                    className="
                      group border-t
                      hover:bg-muted/40
                    "
                  >
                    <td className="p-2">
                      <DailyProgressCell daily={daily} />
                    </td>
                    <td className="p-2">
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
                    </td>
                    <td className="p-2">
                      <span className="inline-flex items-center gap-1.5">
                        <DailyCourseIndicator daily={daily} />
                        <DailyTaskIndicator daily={daily} />
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          currentStatus === null ||
                            currentStatus === "incomplete"
                            ? "text-muted-foreground"
                            : chain > 0
                              ? "text-orange-600"
                              : "text-muted-foreground",
                        )}
                        title={
                          chain > 0 ? `${chain}-day chain` : "No active chain"
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
                    <td className="p-2">
                      {currentStatus !== null && (
                        <DailyCommentPopover daily={daily} />
                      )}
                    </td>
                    <td className="p-2">
                      <TodayStatusCell
                        daily={daily}
                        currentStatus={currentStatus}
                        disabled={mutation.isPending}
                        onChange={(status) =>
                          mutation.mutate({
                            daily,
                            status,
                          })
                        }
                      />
                    </td>
                    {days.map((day, i) => {
                      return (
                        <td
                          key={day.dateKey}
                          className="relative px-1 py-2 align-middle"
                        >
                          {i === 0 && (
                            <DailyStatusConnector
                              left={currentStatus}
                              right={day.status}
                              className="
                                absolute top-1/2 right-[calc(50%+12px)] -left-2
                                z-0 -translate-y-1/2
                              "
                            />
                          )}
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
                    <td className="p-2 whitespace-nowrap">
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
