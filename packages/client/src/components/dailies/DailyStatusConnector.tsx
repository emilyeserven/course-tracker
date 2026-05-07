import type { DailyCompletionStatus } from "@emstack/types/src";

import { getDailyStatusOption } from "./dailyStatusMeta";

import { cn } from "@/lib/utils";

interface DailyStatusConnectorProps {
  left: DailyCompletionStatus | null;
  right: DailyCompletionStatus | null;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

type LinkedStatus = Exclude<DailyCompletionStatus, "incomplete">;

function isLinked(
  status: DailyCompletionStatus | null,
): status is LinkedStatus {
  return status !== null && status !== "incomplete";
}

export function DailyStatusConnector({
  left,
  right,
  className,
  orientation = "horizontal",
}: DailyStatusConnectorProps) {
  const isVertical = orientation === "vertical";
  const baseClass = isVertical ? "h-3 w-0.5" : "h-0.5 w-3";

  if (!isLinked(left) || !isLinked(right)) {
    return (
      <div
        aria-hidden
        className={cn(baseClass, className)}
      />
    );
  }

  const leftColor = getDailyStatusOption(left).borderColor;
  const rightColor = getDailyStatusOption(right).borderColor;

  return (
    <div
      aria-hidden
      className={cn(baseClass, className)}
      style={{
        background: `linear-gradient(${isVertical ? "to bottom" : "to right"}, ${leftColor}, ${rightColor})`,
      }}
    />
  );
}
