import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import { FlameIcon, LaughIcon } from "lucide-react";

import { DailyCommentPopover } from "./DailyCommentPopover";
import { DailyCourseIndicator } from "./DailyCourseIndicator";
import { DailyLocationCell } from "./DailyLocationCell";
import { DailyProgressCell } from "./DailyProgressCell";
import { DailyRecentDaysStrip } from "./DailyRecentDaysStrip";
import { DailyTaskIndicator } from "./DailyTaskIndicator";
import { TodayStatusCell } from "./TodayStatusCell";

import { cn } from "@/lib/utils";
import {
  findStatusForDate,
  getCurrentChain,
  getTotalCompletedDays,
} from "@/utils";

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
    <ul className="flex flex-col divide-y">
      {dailies.map((daily) => {
        const currentStatus = findStatusForDate(daily, todayKey);
        const chain = getCurrentChain(daily, todayKey);
        const total = getTotalCompletedDays(daily);
        return (
          <li
            key={daily.id}
            className="flex flex-col gap-2 py-3"
          >
            <div className="flex flex-row items-start justify-between gap-2">
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
                    className="line-clamp-2 text-xs text-muted-foreground"
                    title={daily.description}
                  >
                    {daily.description}
                  </span>
                )}
              </div>
              <DailyProgressCell daily={daily} />
            </div>

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
                title={chain > 0 ? `${chain}-day chain` : "No active chain"}
              >
                <FlameIcon className="size-3.5" />
                {chain}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  total > 0 ? "text-emerald-600" : "text-muted-foreground",
                )}
                title={`${total} total day${total === 1 ? "" : "s"} completed`}
              >
                <LaughIcon className="size-3.5" />
                {total}
              </span>
              <div className="ml-auto flex flex-row items-center gap-1">
                {currentStatus !== null && (
                  <DailyCommentPopover daily={daily} />
                )}
                <DailyLocationCell
                  location={daily.location}
                  taskId={daily.taskId ?? daily.task?.id ?? null}
                />
              </div>
            </div>

            <DailyRecentDaysStrip
              daily={daily}
              count={recentDaysCount + 1}
              size="sm"
              showLabels={true}
              labelFormat="mmdd"
            />

            <TodayStatusCell
              daily={daily}
              currentStatus={currentStatus}
              disabled={mutationPending}
              onChange={status => onChangeStatus(daily, status)}
            />
          </li>
        );
      })}
    </ul>
  );
}
