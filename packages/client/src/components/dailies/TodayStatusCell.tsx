import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useState } from "react";

import { PencilIcon } from "lucide-react";

import { DailyCommentPopover } from "./DailyCommentPopover";
import { DAILY_STATUS_OPTIONS, getDailyStatusOption } from "./dailyStatusMeta";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TodayStatusCellProps {
  daily: Daily;
  currentStatus: DailyCompletionStatus | null;
  disabled: boolean;
  onChange: (status: DailyCompletionStatus) => void;
}

export function TodayStatusCell({
  daily,
  currentStatus,
  disabled,
  onChange,
}: TodayStatusCellProps) {
  const [editing, setEditing] = useState(false);
  const showSelect = editing || currentStatus === null;
  const option = currentStatus ? getDailyStatusOption(currentStatus) : null;

  return (
    <div className="flex flex-row items-center gap-1">
      {showSelect
        ? (
          <div className="flex w-36">
            <Select
              value={currentStatus ?? undefined}
              disabled={disabled}
              onValueChange={(value) => {
                onChange(value as DailyCompletionStatus);
                setEditing(false);
              }}
              open={editing || undefined}
              onOpenChange={(open) => {
                if (!open) {
                  setEditing(false);
                }
              }}
            >
              <SelectTrigger
                size="sm"
                aria-label={`Set today's status for ${daily.name}`}
                className="w-full"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {DAILY_STATUS_OPTIONS.map(opt => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.icon}
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
        : (
          <div className="flex w-36 flex-row items-center gap-1">
            <span
              className={cn(`
                inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5
                text-xs font-medium
              `, option?.pillClass)}
            >
              {option?.icon}
              {option?.label}
            </span>
            <span className="inline-flex w-7 justify-center">
              <button
                type="button"
                aria-label={`Edit today's status for ${daily.name}`}
                className="
                  rounded-md p-1 text-muted-foreground opacity-0
                  group-hover:opacity-100
                  hover:bg-muted hover:text-foreground
                  focus-visible:opacity-100
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                disabled={disabled}
                onClick={() => setEditing(true)}
              >
                <PencilIcon className="size-3.5" />
              </button>
            </span>
          </div>
        )}
      <DailyCommentPopover daily={daily} />
    </div>
  );
}
