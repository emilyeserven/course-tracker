import { AlertTriangleIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooManyDailiesWarningProps {
  activeCount: number;
  limit: number;
  className?: string;
  size?: "sm" | "md";
}

export function TooManyDailiesWarning({
  activeCount,
  limit,
  className,
  size = "md",
}: TooManyDailiesWarningProps) {
  if (activeCount < limit) {
    return null;
  }

  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              `
                inline-flex items-center gap-1 rounded-md border
                border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-medium
                text-amber-900
                dark:border-amber-500/50 dark:bg-amber-900/40
                dark:text-amber-100
              `,
              className,
            )}
            role="status"
            aria-label="Too many active dailies"
          >
            <AlertTriangleIcon className={iconSize} />
            {activeCount}
            {" / "}
            {limit}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="block max-w-xs">
            You have
            {" "}
            {activeCount}
            {" "}
            active dailies (limit:
            {" "}
            {limit}
            ). Completing all of them every day will be tougher.
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
