import type { Daily, RoutineMode } from "@emstack/types";

import { cn } from "@/lib/utils";

// Dailies here come from the routine projection (mapRoutineToDaily), which
// carries the routine's mode even though the base Daily type doesn't declare it.
// Read it through a narrow local view, mirroring DailyTitle.
export function DailyCadenceBadge({
  daily,
}: {
  daily: Daily;
}) {
  const mode = (daily as Daily & { mode?: RoutineMode }).mode;
  const isWeekly = mode === "weekly";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isWeekly
          ? `
            bg-purple-100 text-purple-700
            dark:bg-purple-950 dark:text-purple-300
          `
          : "bg-muted text-muted-foreground",
      )}
    >
      {isWeekly ? "Weekly" : "Daily"}
    </span>
  );
}
