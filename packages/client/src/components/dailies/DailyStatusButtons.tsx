import type { DailyCompletionStatus } from "@emstack/types/src";

import { DAILY_STATUS_OPTIONS } from "./dailyStatusMeta";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DailyStatusButtonsProps {
  currentStatus: DailyCompletionStatus | null;
  disabled?: boolean;
  onChange: (status: DailyCompletionStatus) => void;
  size?: "sm" | "default";
  className?: string;
  iconOnly?: boolean;
}

export function DailyStatusButtons({
  currentStatus,
  disabled = false,
  onChange,
  size = "sm",
  className,
  iconOnly = false,
}: DailyStatusButtonsProps) {
  return (
    <div className={cn("flex flex-row flex-wrap gap-1", className)}>
      {DAILY_STATUS_OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.value;

        if (iconOnly) {
          return (
            <Button
              key={opt.value}
              type="button"
              size={isActive ? size : (size === "sm" ? "icon-sm" : "icon")}
              variant="outline"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                isActive && opt.pillClass,
                isActive && `
                  min-w-32 border-2
                  hover:opacity-80
                `,
              )}
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={isActive}
            >
              {opt.icon}
              {isActive && opt.label}
            </Button>
          );
        }

        return (
          <Button
            key={opt.value}
            type="button"
            size={size}
            variant={isActive ? "default" : "outline"}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon}
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
