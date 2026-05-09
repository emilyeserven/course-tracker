import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { DAILY_STATUS_OPTIONS } from "./dailyStatusMeta";

import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getTodayKey } from "@/utils";

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
  onChange: (status: DailyCompletionStatus, note: string | null) => void;
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
  const todayKey = getTodayKey();
  const currentNote
    = daily.completions.find(c => c.date === todayKey)?.note ?? "";

  const [selected, setSelected] = useState<DailyCompletionStatus | null>(
    currentStatus,
  );
  const [comment, setComment] = useState(currentNote);

  useEffect(() => {
    if (open) {
      setSelected(currentStatus);
      setComment(currentNote);
    }
  }, [open, currentStatus, currentNote]);

  const criteria = daily.criteria ?? {};
  const trimmedComment = comment.trim();
  const noteChanged = trimmedComment !== currentNote.trim();
  const statusChanged = selected !== null && selected !== currentStatus;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected && (statusChanged || noteChanged)) {
      onChange(selected, trimmedComment || null);
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader className="text-left">
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
          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="dailyStatusComment">
              Comment
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="dailyStatusComment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment for today..."
              maxLength={500}
              className="min-h-20"
            />
          </div>
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
              disabled={disabled || !selected
                || (!statusChanged && !noteChanged)}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
