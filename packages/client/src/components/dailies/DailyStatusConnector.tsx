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

  if (left === null || right === null) {
    return (
      <div
        aria-hidden
        className={cn(baseClass, className)}
      />
    );
  }

  if (!isLinked(left) || !isLinked(right)) {
    return (
      <div
        aria-hidden
        className={cn(
          baseClass,
          `
            bg-neutral-400/15
            dark:bg-neutral-500/20
          `,
          className,
        )}
      />
    );
  }

  const leftColor = getDailyStatusOption(left).borderColor;
  const rightColor = getDailyStatusOption(right).borderColor;
  const direction = isVertical ? "to bottom" : "to right";
  const isFreezeConnector = left === "freeze" || right === "freeze";
  const dashMask
    = `repeating-linear-gradient(${direction}, black 0 2px, transparent 2px 3px)`;

  return (
    <div
      aria-hidden
      className={cn(baseClass, className)}
      style={{
        background: `linear-gradient(${direction}, ${leftColor}, ${rightColor})`,
        ...(isFreezeConnector && {
          WebkitMaskImage: dashMask,
          maskImage: dashMask,
        }),
      }}
    />
  );
}
