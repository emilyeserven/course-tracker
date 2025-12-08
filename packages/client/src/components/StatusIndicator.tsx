import type { CourseStatus } from "@emstack/types/src";

import { CheckCircle, PauseCircle, PlayCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";

interface StatusIndicatorProps { status: CourseStatus }

export function StatusIndicator({
  status,
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {status && status === "inactive" && (
        <Tooltip>
          <TooltipTrigger>
            <PauseCircle size={16} />
          </TooltipTrigger>
          <TooltipContent>
            Paused
          </TooltipContent>
        </Tooltip>
      )}
      {status && status === "active" && (
        <Tooltip>
          <TooltipTrigger>
            <PlayCircle size={16} />
          </TooltipTrigger>
          <TooltipContent>
            Active
          </TooltipContent>
        </Tooltip>
      )}
      {status && status === "complete" && (
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle size={16} />
          </TooltipTrigger>
          <TooltipContent>
            Completed
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
