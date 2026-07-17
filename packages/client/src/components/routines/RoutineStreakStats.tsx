import type { DailyCompletion } from "@emstack/types";

import { FlameIcon, LaughIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCurrentChain, getTotalCompletedDays } from "@/utils";

interface RoutineStreakStatsProps {
  completions: DailyCompletion[] | null | undefined;
}

// The chain / total-days stat pair in a routine card's footer, derived from
// the routine's logged completions.
export function RoutineStreakStats({
  completions,
}: RoutineStreakStatsProps) {
  const chain = getCurrentChain({
    completions: completions ?? [],
  });
  const totalDays = getTotalCompletedDays({
    completions: completions ?? [],
  });

  return (
    <div className="flex flex-row items-center gap-4 text-xs">
      <span
        className="inline-flex items-center gap-1"
        title="Current day chain"
      >
        <FlameIcon
          size={14}
          className={
            chain > 0 ? "text-orange-600" : "text-muted-foreground"
          }
        />
        <strong>{chain}</strong>
      </span>
      <span
        className="inline-flex items-center gap-1"
        title="Total completed days"
      >
        <LaughIcon
          className={cn(
            "size-3.5",
            totalDays > 0 ? "text-emerald-600" : "text-muted-foreground",
          )}
        />
        <strong>{totalDays}</strong>
      </span>
    </div>
  );
}
