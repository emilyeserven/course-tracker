import type { DayLabelFormat } from "@/utils/dailyHelpers";
import type { Daily } from "@emstack/types/src";

import { Fragment } from "react";

import { DailyStatusCircle } from "./DailyStatusCircle";
import { DailyStatusConnector } from "./DailyStatusConnector";

import { cn } from "@/lib/utils";
import { getReferenceDateKey, getRecentDays } from "@/utils/dailyHelpers";

interface DailyRecentDaysStripProps {
  daily: Daily;
  count?: number;
  className?: string;
  labelFormat?: DayLabelFormat;
  size?: "sm" | "md" | "lg" | "xl";
  showLabels?: boolean;
}

const CONNECTOR_TOP_BY_SIZE: Record<
  NonNullable<DailyRecentDaysStripProps["size"]>,
  string
> = {
  sm: "mt-[11px]",
  md: "mt-[15px]",
  lg: "mt-[19px]",
  xl: "mt-[23px]",
};

export function DailyRecentDaysStrip({
  daily,
  count = 7,
  className,
  labelFormat = "dow",
  size = "lg",
  showLabels = true,
}: DailyRecentDaysStripProps) {
  const days = getRecentDays(daily, count, getReferenceDateKey(daily), labelFormat);

  return (
    <div
      className={cn(
        "flex flex-row items-start overflow-x-auto py-1 [scrollbar-width:thin]",
        className,
      )}
    >
      {days.map((day, i) => (
        <Fragment key={day.dateKey}>
          {i > 0 && (
            <DailyStatusConnector
              left={days[i - 1].status}
              right={day.status}
              className={cn("w-6 shrink-0", CONNECTOR_TOP_BY_SIZE[size])}
            />
          )}
          <div className="flex shrink-0 flex-col items-center gap-0.5">
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
