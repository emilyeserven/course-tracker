import type { DailyCompletionStatus } from "@emstack/types/src";

import { getDailyStatusOption } from "./dailyStatusMeta";

import { cn } from "@/lib/utils";

interface DailyStatusConnectorProps {
  left: DailyCompletionStatus | null;
  right: DailyCompletionStatus | null;
  className?: string;
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
}: DailyStatusConnectorProps) {
  if (!isLinked(left) || !isLinked(right)) {
    return (
      <div
        aria-hidden
        className={cn("h-0.5 w-3", className)}
      />
    );
  }

  const leftColor = getDailyStatusOption(left).borderColor;
  const rightColor = getDailyStatusOption(right).borderColor;

  return (
    <div
      aria-hidden
      className={cn("h-0.5 w-3", className)}
      style={{
        background: `linear-gradient(to right, ${leftColor}, ${rightColor})`,
      }}
    />
  );
}
