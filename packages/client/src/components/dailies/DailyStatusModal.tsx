import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { DAILY_STATUS_OPTIONS } from "./dailyStatusMeta";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CRITERIA_KEY_BY_STATUS: Record<DailyCompletionStatus, keyof NonNullable<Daily["criteria"]>> = {
  incomplete: "incomplete",
  touched: "touched",
  goal: "goal",
  exceeded: "exceeded",
  freeze: "freeze",
};

interface DailyStatusModalProps {
  daily: Daily;
  currentStatus: DailyCompletionStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (status: DailyCompletionStatus) => void;
  disabled?: boolean;
}

export function DailyStatusModal({
  daily,
  currentStatus,
  open,
  onOpenChange,
  onChange,
  disabled = false,
}: DailyStatusModalProps) {
  const [selected, setSelected] = useState<DailyCompletionStatus | null>(
    currentStatus,
  );

  useEffect(() => {
    if (open) {
      setSelected(currentStatus);
    }
  }, [open, currentStatus]);

  const criteria = daily.criteria ?? {};

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected && selected !== currentStatus) {
      onChange(selected);
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {daily.name}
            : Change Today&apos;s Status
          </DialogTitle>
          {daily.description
            ? (
              <DialogDescription>
                Great job! Remember, every day of progress brings you closer to
                achieving the reason you&apos;re working on this:
                {" "}
                <span className="whitespace-pre-wrap text-foreground">
                  {daily.description}
                </span>
              </DialogDescription>
            )
            : (
              <DialogDescription className="sr-only">
                Change today&apos;s status for
                {" "}
                {daily.name}
                .
              </DialogDescription>
            )}
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 pt-2"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Today&apos;s status</legend>
            {DAILY_STATUS_OPTIONS.map((opt) => {
              const isSelected = selected === opt.value;
              const description = criteria[CRITERIA_KEY_BY_STATUS[opt.value]];
              return (
                <label
                  key={opt.value}
                  className={cn(
                    `
                      flex cursor-pointer flex-row items-start gap-3 rounded-md
                      border-2 p-3 transition-colors
                    `,
                    isSelected
                      ? opt.pillClass
                      : `
                        border-input bg-background
                        hover:bg-muted/50
                      `,
                  )}
                  style={isSelected
                    ? {
                      borderColor: opt.borderColor,
                    }
                    : undefined}
                >
                  <input
                    type="radio"
                    name="dailyStatusSelection"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => setSelected(opt.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-col gap-1">
                    <div
                      className="
                        flex flex-row items-center gap-1.5 text-sm font-bold
                      "
                    >
                      <span className="inline-flex shrink-0 items-center">
                        {opt.icon}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    {description
                      ? (
                        <p
                          className={cn(
                            "text-sm whitespace-pre-wrap",
                            isSelected ? "" : "text-muted-foreground",
                          )}
                        >
                          {description}
                        </p>
                      )
                      : (
                        <p className="text-xs text-muted-foreground/70 italic">
                          No criteria set for this status.
                        </p>
                      )}
                  </div>
                </label>
              );
            })}
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={disabled || !selected || selected === currentStatus}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
