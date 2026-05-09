import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { getDailyStatusOption } from "./dailyStatusMeta";
import { DailyStatusModal } from "./DailyStatusModal";

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
  const [modalOpen, setModalOpen] = useState(false);
  const option = currentStatus ? getDailyStatusOption(currentStatus) : null;

  return (
    <div className="flex flex-row items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setModalOpen(true)}
        aria-label={currentStatus
          ? `Change today's status for ${daily.name}`
          : `Set today's status for ${daily.name}`}
        className={cn(
          `
            focus-visible:ring-ring
            inline-flex cursor-pointer items-center gap-1 rounded-full border-2
            px-2 py-0.5 text-xs font-medium transition-colors
            focus-visible:ring-2 focus-visible:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
          `,
          option
            ? `
              ${option.pillClass}
              hover:opacity-80
            `
            : `
              border-muted-foreground/40 bg-background text-muted-foreground
              hover:bg-muted
              border-dashed
            `,
        )}
      >
        {option
          ? (
            <>
              {option.icon}
              {option.label}
            </>
          )
          : (
            <span>Select…</span>
          )}
      </button>
      <DailyStatusModal
        daily={daily}
        currentStatus={currentStatus}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
