import type { Daily } from "@emstack/types/src";

import { DailyStatusCircle } from "./DailyStatusCircle";

import { cn } from "@/lib/utils";
import { getRecentDays } from "@/utils/dailyHelpers";

interface DailyRecentDaysStripProps {
  daily: Daily;
  count?: number;
  className?: string;
}

export function DailyRecentDaysStrip({
  daily,
  count = 7,
  className,
}: DailyRecentDaysStripProps) {
  const days = getRecentDays(daily, count);

  return (
    <div className={cn("flex flex-row gap-1.5", className)}>
      {days.map(day => (
        <div
          key={day.dateKey}
          className="flex flex-col items-center gap-0.5"
        >
          <DailyStatusCircle
            status={day.status}
            size="sm"
            highlight={day.isToday}
            title={`${day.dateKey}${day.status ? ` — ${day.status}` : " — no entry"}`}
          />
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
        </div>
      ))}
    </div>
  );
}
