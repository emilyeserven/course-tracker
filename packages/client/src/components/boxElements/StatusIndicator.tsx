import type { CourseStatus } from "@emstack/types/src";

import { CheckCircle, PauseCircle, PlayCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";

interface StatusIndicatorProps { status: CourseStatus }

export function StatusIndicator({
  status,
}: StatusIndicatorProps) {
  const ICON_SIZE = 18;

  return (
    <div className="flex items-center justify-center">
      {status && status === "inactive" && (
        <Tooltip>
          <TooltipTrigger>
            <PauseCircle size={ICON_SIZE} />
          </TooltipTrigger>
          <TooltipContent>
            Paused
          </TooltipContent>
        </Tooltip>
      )}
      {status && status === "active" && (
        <Tooltip>
          <TooltipTrigger>
            <PlayCircle size={ICON_SIZE} />
          </TooltipTrigger>
          <TooltipContent>
            Active
          </TooltipContent>
        </Tooltip>
      )}
      {status && status === "complete" && (
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle size={ICON_SIZE} />
          </TooltipTrigger>
          <TooltipContent>
            Completed
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
