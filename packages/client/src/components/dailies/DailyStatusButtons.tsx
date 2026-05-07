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
}

export function DailyStatusButtons({
  currentStatus,
  disabled = false,
  onChange,
  size = "sm",
  className,
}: DailyStatusButtonsProps) {
  return (
    <div className={cn("flex flex-row flex-wrap gap-1", className)}>
      {DAILY_STATUS_OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.value;
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
