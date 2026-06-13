import { AlertTriangleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

  // Override the Badge base's `[&>svg]:size-3` so the warning icon keeps its
  // larger size.
  const iconSize = size === "sm" ? "[&>svg]:size-4" : "[&>svg]:size-5";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              `
                border-amber-400 bg-amber-100 text-amber-900
                dark:border-amber-500/50 dark:bg-amber-900/40
                dark:text-amber-100
              `,
              iconSize,
              className,
            )}
            role="status"
            aria-label="Too many active dailies"
          >
            <AlertTriangleIcon />
            {activeCount}
            {" / "}
            {limit}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="block max-w-xs">
            You have {activeCount} active dailies (limit: {limit}
            ). Completing all of them every day will be tougher.
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
