import type { DayLabelFormat } from "@/utils/dailyHelpers";
import type { Daily } from "@emstack/types/src";

import { Fragment } from "react";

import { DailyStatusCircle } from "./DailyStatusCircle";
import { DailyStatusConnector } from "./DailyStatusConnector";

import { cn } from "@/lib/utils";
import { getRecentDays, getTodayKey } from "@/utils/dailyHelpers";

interface DailyRecentDaysStripProps {
  daily: Daily;
  count?: number;
  className?: string;
  labelFormat?: DayLabelFormat;
  size?: "sm" | "md" | "lg" | "xl";
  showLabels?: boolean;
}

export function DailyRecentDaysStrip({
  daily,
  count = 7,
  className,
  labelFormat = "dow",
  size = "lg",
  showLabels = true,
}: DailyRecentDaysStripProps) {
  const days = getRecentDays(daily, count, getTodayKey(), labelFormat);

  return (
    <div className={cn("flex flex-row items-end", className)}>
      {days.map((day, i) => (
        <Fragment key={day.dateKey}>
          {i > 0 && (
            <DailyStatusConnector
              left={days[i - 1].status}
              right={day.status}
              className={showLabels ? "mb-3" : undefined}
            />
          )}
          <div className="flex flex-col items-center gap-0.5">
            <DailyStatusCircle
              status={day.status}
              size={size}
              highlight={day.isToday}
              title={`${day.dateKey}${day.status ? ` — ${day.status}` : " — no entry"}`}
            />
            {showLabels && (
              <span
                className={cn(
                  "text-[0.65rem] leading-none",
                  day.isToday
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {day.dayLabel}
              </span>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
