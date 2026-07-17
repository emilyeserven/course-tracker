import type { Daily, DailyCompletionStatus } from "@emstack/types";

import { Fragment } from "react";

import { Link } from "@tanstack/react-router";
import { FlameIcon, LaughIcon } from "lucide-react";

import {
  DailyCommentPopover,
  DailyLocationCell,
  DailyProgressCell,
  DailyStatusCircle,
  DailyStatusConnector,
  DailyTaskIndicator,
  DailyTitle,
  TodayStatusCell,
} from "./dailyCells";

import { cn } from "@/lib/utils";
import {
  findStatusForDate,
  getCurrentChain,
  getRecentDays,
  getReferenceDateKey,
  getTotalCompletedDays,
} from "@/utils";

interface DailyActiveRowProps {
  daily: Daily;
  todayKey: string;
  onChangeStatus: (
    daily: Daily,
    status: DailyCompletionStatus,
    note: string | null,
  ) => void;
  mutationPending: boolean;
  recentDaysCount: number;
}

// One daily's card in the active-list view: progress ring, title link,
// chain/total stats, location, today's status control, and the recent-days
// mini strip with connectors.
export function DailyActiveRow({
  daily,
  todayKey,
  onChangeStatus,
  mutationPending,
  recentDaysCount,
}: DailyActiveRowProps) {
  const currentStatus = findStatusForDate(daily, todayKey);
  const chain = getCurrentChain(daily, todayKey);
  const total = getTotalCompletedDays(daily);
  const referenceKey = getReferenceDateKey(daily, todayKey);
  const recentDays = getRecentDays(
    daily,
    recentDaysCount + 1,
    referenceKey,
    "mmdd",
  )
    .slice(0, -1)
    .reverse();
  const mostRecentPast = recentDays[0] ?? null;
  return (
    <li
      className="
        flex flex-col gap-2.5 border-b py-3
        lg:border-b
        lg:even:border-l lg:even:pl-6
      "
    >
      <div className="flex w-full min-w-0 flex-row items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <DailyProgressCell daily={daily} />
        </div>
        <div className="flex w-full min-w-0 flex-col gap-1">
          {daily.kind === "todo" && daily.taskId
            ? (
              <Link
                to="/tasks/$id"
                params={{
                  id: daily.taskId,
                }}
                className="
                  truncate font-medium
                  hover:text-blue-600
                "
              >
                <DailyTitle daily={daily} />
              </Link>
            )
            : (
              <Link
                to="/routines/$id"
                params={{
                  id: daily.id,
                }}
                className="
                  truncate font-medium
                  hover:text-blue-600
                "
              >
                <DailyTitle daily={daily} />
              </Link>
            )}
          <div
            className="
              flex w-full flex-row flex-wrap items-center justify-between
              gap-x-4 gap-y-2 text-sm
            "
          >
            <div className="flex flex-row items-center gap-6">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
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
                <FlameIcon className="size-4" />
                {chain}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  total > 0
                    ? "text-emerald-600"
                    : "text-muted-foreground",
                )}
                title={`${total} total day${total === 1 ? "" : "s"} completed`}
              >
                <LaughIcon className="size-4" />
                {total}
              </span>
              <span
                className="
                  inline-flex items-center gap-2
                  [&_a>svg]:size-5
                "
              >
                <DailyTaskIndicator daily={daily} />
              </span>
            </div>
            <span
              className="
                [&_a]:px-2.5 [&_a]:py-1.5 [&_a]:text-sm
                [&_svg]:size-4
              "
            >
              <DailyLocationCell
                location={daily.location}
                taskId={daily.taskId ?? daily.task?.id ?? null}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start">
        <div
          className="flex w-full flex-row items-center justify-between gap-2"
        >
          <div
            className="
              w-full
              [&_button]:px-3 [&_button]:py-1 [&_button]:text-sm
              [&_svg]:size-4
            "
          >
            <TodayStatusCell
              daily={daily}
              currentStatus={currentStatus}
              disabled={mutationPending}
              onChange={(status, note) =>
                onChangeStatus(daily, status, note)}
            />
          </div>
          {currentStatus !== null && (
            <DailyCommentPopover
              daily={daily}
              buttonClassName="size-9 [&_svg]:size-4"
            />
          )}
        </div>
        <DailyStatusConnector
          orientation="vertical"
          left={currentStatus}
          right={mostRecentPast?.status ?? null}
          className="ml-[11px] h-3 shrink-0"
        />
        <div className="flex w-full flex-row items-start">
          {recentDays.map((day, i) => (
            <Fragment key={day.dateKey}>
              {i > 0 && (
                <DailyStatusConnector
                  left={recentDays[i - 1].status}
                  right={day.status}
                  className="mt-[11px] w-full min-w-2.5"
                />
              )}
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <DailyStatusCircle
                  status={day.status}
                  size="sm"
                  title={`${day.dateKey}${day.status ? ` — ${day.status}` : " — no entry"}`}
                />
                <span
                  className="text-[0.65rem] leading-none text-muted-foreground"
                >
                  {day.dayLabel}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </li>
  );
}
