import type { Daily, RoutineMode } from "@emstack/types";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  const badge = (
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

  // A weekly routine's row shows today's scheduled action as its title, so the
  // routine's own name never appears in the row. Surface it on hover/focus of
  // the Weekly tag. Daily routines already title themselves, so they need none.
  if (!isWeekly) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>{daily.name}</TooltipContent>
    </Tooltip>
  );
}
