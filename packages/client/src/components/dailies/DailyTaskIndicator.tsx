import type { Daily } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import { CheckSquareIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/tasks/$id"
          params={{
            id: task.id,
          }}
          aria-label={`Go to task ${task.name}`}
          className="
            inline-flex items-center text-muted-foreground
            hover:text-foreground
          "
        >
          <CheckSquareIcon className="size-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{task.name}</TooltipContent>
    </Tooltip>
  );
}
