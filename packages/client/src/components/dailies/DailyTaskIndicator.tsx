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

  const titlesMatch = task.name.trim().toLowerCase()
    === daily.name.trim().toLowerCase();
  const tooltip = titlesMatch ? "Go to Task" : task.name;

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
            text-muted-foreground
            hover:text-foreground
            inline-flex items-center
          "
        >
          <CheckSquareIcon className="size-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
