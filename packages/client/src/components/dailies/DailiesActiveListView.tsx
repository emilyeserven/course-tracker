import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { Fragment } from "react";

import { Link } from "@tanstack/react-router";
import { FlameIcon, LaughIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  findStatusForDate,
  getCurrentChain,
  getRecentDays,
  getReferenceDateKey,
  getTotalCompletedDays,
} from "@/utils";

import { DailyCommentPopover } from "./DailyCommentPopover";
import { DailyCourseIndicator } from "./DailyCourseIndicator";
import { DailyLocationCell } from "./DailyLocationCell";
import { DailyProgressCell } from "./DailyProgressCell";
import { DailyStatusCircle } from "./DailyStatusCircle";
import { DailyStatusConnector } from "./DailyStatusConnector";
import { DailyTaskIndicator } from "./DailyTaskIndicator";
import { TodayStatusCell } from "./TodayStatusCell";

interface DailiesActiveListViewProps {
  dailies: Daily[];
  todayKey: string;
  onChangeStatus: (daily: Daily, status: DailyCompletionStatus) => void;
  mutationPending: boolean;
  recentDaysCount?: number;
}

export function DailiesActiveListView({
  dailies,
  todayKey,
  onChangeStatus,
  mutationPending,
  recentDaysCount = 6,
}: DailiesActiveListViewProps) {
  return (
    <ul
      className="
        grid grid-cols-1 gap-x-6 divide-y
        lg:grid-cols-2 lg:divide-y-0
      "
    >
      {dailies.map((daily) => {
        const currentStatus = findStatusForDate(daily, todayKey);
        const chain = getCurrentChain(daily, todayKey);
        const total = getTotalCompletedDays(daily);
        const referenceKey = getReferenceDateKey(daily, todayKey);
        const recentDays = getRecentDays(
          daily,
          recentDaysCount + 1,
          referenceKey,
          "mmdd",
        ).slice(0, -1).reverse();
        const mostRecentPast = recentDays[0] ?? null;
        return (
          <li
            key={daily.id}
            className="
              flex flex-col gap-2 border-b py-3
              lg:border-b
              lg:even:border-l lg:even:pl-6
            "
          >
            <div
              className="flex flex-row items-start justify-between gap-2"
            >
              <div className="flex min-w-0 flex-row items-start gap-2">
                <div className="mt-0.5 shrink-0">
                  <DailyProgressCell daily={daily} />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Link
                      to="/dailies/$id"
                      params={{
                        id: daily.id,
                      }}
                      className="
                        truncate font-medium
                        hover:text-blue-600
                      "
                    >
                      {daily.name}
                    </Link>
                    <DailyCourseIndicator daily={daily} />
                    <DailyTaskIndicator daily={daily} />
                  </span>
                  {daily.description && (
                    <span
                      className="text-muted-foreground line-clamp-2 text-xs"
                      title={daily.description}
                    >
                      {daily.description}
                    </span>
                  )}
                  <div className="flex flex-row items-center gap-3 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        currentStatus === "incomplete"
                          ? "text-muted-foreground"
                          : chain > 0
                            ? "text-orange-600"
                            : "text-muted-foreground",
                      )}
                      title={chain > 0
                        ? `${chain}-day chain`
                        : "No active chain"}
                    >
                      <FlameIcon className="size-3.5" />
                      {chain}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        total > 0
                          ? "text-emerald-600"
                          : "text-muted-foreground",
                      )}
                      title={`${total} total day${total === 1 ? "" : "s"} completed`}
                    >
                      <LaughIcon className="size-3.5" />
                      {total}
                    </span>
                  </div>
                </div>
              </div>
              <DailyLocationCell
                location={daily.location}
                taskId={daily.taskId ?? daily.task?.id ?? null}
              />
            </div>

            <div className="flex flex-row items-start gap-1">
              <div className="flex shrink-0 flex-row items-start gap-1">
                <div className="flex flex-col items-center gap-0.5">
                  <TodayStatusCell
                    daily={daily}
                    currentStatus={currentStatus}
                    disabled={mutationPending}
                    onChange={status => onChangeStatus(daily, status)}
                  />
                  <span
                    className="
                      text-foreground text-[0.65rem] leading-none font-semibold
                    "
                  >
                    Today
                  </span>
                </div>
                {currentStatus !== null && (
                  <div className="mt-1">
                    <DailyCommentPopover daily={daily} />
                  </div>
                )}
              </div>
              <DailyStatusConnector
                left={currentStatus}
                right={mostRecentPast?.status ?? null}
                className="mt-[11px] w-2.5 shrink-0"
              />
              {recentDays.map((day, i) => (
                <Fragment key={day.dateKey}>
                  {i > 0 && (
                    <DailyStatusConnector
                      left={recentDays[i - 1].status}
                      right={day.status}
                      className="mt-[11px] w-2.5 shrink-0"
                    />
                  )}
                  <div
                    className="flex shrink-0 flex-col items-center gap-0.5"
                  >
                    <DailyStatusCircle
                      status={day.status}
                      size="sm"
                      title={`${day.dateKey}${day.status ? ` — ${day.status}` : " — no entry"}`}
                    />
                    <span
                      className="
                        text-muted-foreground text-[0.65rem] leading-none
                      "
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
