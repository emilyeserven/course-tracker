import type { DailyDayHeader } from "@/hooks/useDailyTracker";
import type { Daily, DailyCompletionStatus } from "@emstack/types";

import { Link } from "@tanstack/react-router";
import { FlameIcon, LaughIcon } from "lucide-react";

import { DailyCadenceBadge } from "./DailyCadenceBadge";
// Shares the same daily-cell building blocks as DailiesActiveListView; the
// overlapping import block is incidental.
// fallow-ignore-next-line code-duplication
import { DailyCommentPopover } from "./DailyCommentPopover";
import { DailyLocationCell } from "./DailyLocationCell";
import { DailyProgressCell } from "./DailyProgressCell";
import { DailyResourceIndicator } from "./DailyResourceIndicator";
import { DailyStatusCircle } from "./DailyStatusCircle";
import { DailyStatusConnector } from "./DailyStatusConnector";
import { DailyTaskIndicator } from "./DailyTaskIndicator";
import { DailyTitle } from "./DailyTitle";
import { TodayStatusCell } from "./TodayStatusCell";

import { cn } from "@/lib/utils";
import {
  findStatusForDate,
  getCurrentChain,
  getRecentDays,
  getTotalCompletedDays,
} from "@/utils";

interface DailyTrackerRowProps {
  daily: Daily;
  todayKey: string;
  recentDaysCount: number;
  mutationPending: boolean;
  onChangeStatus: (daily: Daily, status: DailyCompletionStatus) => void;
  /** `<tr>` className — the two tracker tables differ only by `align-middle`. */
  rowClassName: string;
  /** `<td>` wrapping the today-status cell — the wider table uses `w-36 p-2`. */
  statusCellClassName: string;
  /** className for the leading day-status connector (`w-auto` in the full table). */
  firstConnectorClassName: string;
  /** Task id used to render a task link in the location cell, when present. */
  taskId?: string | null;
}

/** A single active-daily row shared by the dashboard card and the routine tracker tables. */
export function DailyTrackerRow({
  daily,
  todayKey,
  recentDaysCount,
  mutationPending,
  onChangeStatus,
  rowClassName,
  statusCellClassName,
  firstConnectorClassName,
  taskId,
}: DailyTrackerRowProps) {
  const currentStatus = findStatusForDate(daily, todayKey);
  const chain = getCurrentChain(daily, todayKey);
  const total = getTotalCompletedDays(daily);
  const days = getRecentDays(daily, recentDaysCount + 1, todayKey, "mmdd")
    .slice(0, -1)
    .reverse();
  return (
    <tr
      key={daily.id}
      className={rowClassName}
    >
      <td className="p-2">
        <DailyProgressCell daily={daily} />
      </td>
      <td className="p-2">
        <Link
          to="/routines/$id"
          params={{
            id: daily.id,
          }}
          className="
            font-medium
            hover:text-blue-600
          "
        >
          <DailyTitle daily={daily} />
        </Link>
      </td>
      <td className="p-2">
        <span className="inline-flex items-center gap-1.5">
          <DailyResourceIndicator daily={daily} />
          <DailyTaskIndicator daily={daily} />
        </span>
      </td>
      <td className="p-2">
        <DailyCadenceBadge daily={daily} />
      </td>
      <td className="p-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            currentStatus === null || currentStatus === "incomplete"
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
      </td>
      <td className="p-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            total > 0 ? "text-emerald-600" : "text-muted-foreground",
          )}
          title={`${total} total day${total === 1 ? "" : "s"} completed`}
        >
          <LaughIcon className="size-3.5" />
          {total}
        </span>
      </td>
      <td className="p-2">
        {currentStatus !== null && <DailyCommentPopover daily={daily} />}
      </td>
      <td className={statusCellClassName}>
        <TodayStatusCell
          daily={daily}
          currentStatus={currentStatus}
          disabled={mutationPending}
          onChange={status => onChangeStatus(daily, status)}
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
                className={firstConnectorClassName}
              />
            )}
            {i > 0 && (
              <DailyStatusConnector
                left={days[i - 1].status}
                right={day.status}
                className="
                  absolute top-1/2 right-[calc(50%+12px)] left-[calc(-50%+12px)]
                  z-0 w-auto -translate-y-1/2
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
        <DailyLocationCell
          location={daily.location}
          taskId={taskId}
        />
      </td>
    </tr>
  );
}

interface DailyTrackerHeadColumnsProps {
  dayHeaders: DailyDayHeader[];
  /** Today-status header cell className — the wider table adds `w-36`. */
  statusThClassName: string;
}

/**
 * The trailing header cells (today's status, the recent-day columns, location)
 * shared by the dashboard card and routine tracker tables.
 */
export function DailyTrackerHeadColumns({
  dayHeaders,
  statusThClassName,
}: DailyTrackerHeadColumnsProps) {
  return (
    <>
      <th className={statusThClassName}>Today&apos;s Status</th>
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
      <th className="p-2 font-medium whitespace-nowrap">Location</th>
    </>
  );
}
