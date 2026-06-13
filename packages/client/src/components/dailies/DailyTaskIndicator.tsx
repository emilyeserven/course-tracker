import type { Daily } from "@emstack/types";

import { CheckSquareIcon } from "lucide-react";

import { DailyEntityLink } from "./DailyEntityLink";

import { dailyLinkTooltip } from "@/utils";

interface DailyTaskIndicatorProps {
  daily: Daily;
}

export function DailyTaskIndicator({
  daily,
}: DailyTaskIndicatorProps) {
  const task = daily.task;
  if (!task) {
    return null;
  }

  return (
    <DailyEntityLink
      entity="tasks"
      id={task.id}
      icon={<CheckSquareIcon className="size-4" />}
      tooltip={dailyLinkTooltip(task.name, daily.name, "Go to Task")}
      ariaLabel={`Go to task ${task.name}`}
    />
  );
}
