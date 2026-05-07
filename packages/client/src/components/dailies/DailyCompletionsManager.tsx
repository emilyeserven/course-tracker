import type { ViewMonth } from "./MonthYearPicker";
import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { DailyStatusButtons } from "./DailyStatusButtons";
import { DailyStatusCircle } from "./DailyStatusCircle";
import { MonthYearPicker } from "./MonthYearPicker";
import { NoteEditButton } from "./NoteEditButton";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getTodayKey,
  shiftDateKey,
  upsertDaily,
  withCompletion,
  withCompletionNote,
} from "@/utils";

interface DailyCompletionsManagerProps {
  daily: Daily;
  readOnly?: boolean;
}

const RECENT_DAYS_COUNT = 30;
const EARLIEST_PICKER_YEAR = 2020;

function formatDateLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKeyFromYM(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function getMonthFromKey(dateKey: string): ViewMonth {
  const d = new Date(`${dateKey}T00:00:00Z`);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
  };
}

function isSameMonth(a: ViewMonth, b: ViewMonth): boolean {
  return a.year === b.year && a.month === b.month;
}

function isAfterMonth(a: ViewMonth, b: ViewMonth): boolean {
  return a.year > b.year || (a.year === b.year && a.month > b.month);
}

function shiftMonth(m: ViewMonth, delta: number): ViewMonth {
  const d = new Date(Date.UTC(m.year, m.month + delta, 1));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
  };
}

function buildVisibleDateKeys(
  viewMonth: ViewMonth,
  currentMonth: ViewMonth,
  todayKey: string,
): string[] {
  if (isSameMonth(viewMonth, currentMonth)) {
    const keys: string[] = [];
    for (let i = 0; i < RECENT_DAYS_COUNT; i++) {
      keys.push(shiftDateKey(todayKey, -i));
    }
    return keys;
  }
  const total = daysInMonth(viewMonth.year, viewMonth.month);
  const keys: string[] = [];
  for (let day = total; day >= 1; day--) {
    keys.push(dateKeyFromYM(viewMonth.year, viewMonth.month, day));
  }
  return keys;
}

export function DailyCompletionsManager({
  daily,
  readOnly = false,
}: DailyCompletionsManagerProps) {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const currentMonth = getMonthFromKey(todayKey);

  const [viewMonth, setViewMonth] = useState<ViewMonth>(currentMonth);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const completionsByDate = useMemo(() => {
    const map = new Map<
      string,
      { status: DailyCompletionStatus | null;
        note: string | null; }
    >();
    for (const c of daily.completions) {
      map.set(c.date, {
        status: c.status ?? null,
        note: c.note ?? null,
      });
    }
    return map;
  }, [daily.completions]);

  const visibleDateKeys = useMemo(
    () => buildVisibleDateKeys(viewMonth, currentMonth, todayKey),
    [viewMonth, currentMonth, todayKey],
  );

  const mutation = useMutation({
    mutationFn: (
      args:
        | {
          kind: "status";
          dateKey: string;
          status: DailyCompletionStatus | null;
        }
        | {
          kind: "note";
          dateKey: string;
          note: string | null;
        },
    ) => {
      const completions = args.kind === "status"
        ? withCompletion(daily, args.dateKey, args.status)
        : withCompletionNote(daily, args.dateKey, args.note);
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
        courseProviderId: daily.provider?.id ?? null,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["daily", daily.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
      ]);
    },
    onError: () => {
      toast.error("Failed to update completion.");
    },
  });

  const isCurrentMonth = isSameMonth(viewMonth, currentMonth);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <h3 className="text-lg font-semibold">Logged entries</h3>
        <div className="flex flex-row items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMonth(m => shiftMonth(m, -1))}
            disabled={shiftMonth(viewMonth, -1).year < EARLIEST_PICKER_YEAR}
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Popover
            open={monthPickerOpen}
            onOpenChange={setMonthPickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-40 justify-center font-normal"
              >
                <CalendarIcon className="mr-2 size-4" />
                {isCurrentMonth
                  ? "Last 30 days"
                  : formatMonthLabel(viewMonth.year, viewMonth.month)}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="end"
            >
              <MonthYearPicker
                viewMonth={viewMonth}
                currentMonth={currentMonth}
                earliestYear={EARLIEST_PICKER_YEAR}
                onChange={(m) => {
                  setViewMonth(m);
                  setMonthPickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMonth(m => shiftMonth(m, 1))}
            disabled={
              isCurrentMonth
              || isAfterMonth(shiftMonth(viewMonth, 1), currentMonth)
            }
            aria-label="Next month"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
      {visibleDateKeys.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No days to show.</i>
        </p>
      )}
      {visibleDateKeys.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border">
          {visibleDateKeys.map((dateKey) => {
            const entry = completionsByDate.get(dateKey);
            const status = entry?.status ?? null;
            const note = entry?.note ?? null;
            const hasStatusEntry = status !== null;
            const isFuture = dateKey > todayKey;
            const isToday = dateKey === todayKey;
            const isEditable = !readOnly || isToday;
            return (
              <li
                key={dateKey}
                className={cn(
                  `
                    group flex flex-row flex-wrap items-center justify-between
                    gap-2 p-2
                  `,
                  isFuture && "opacity-60",
                )}
              >
                <div className="flex min-w-0 flex-row items-center gap-3">
                  <DailyStatusCircle
                    status={status}
                    size="lg"
                  />
                  <span className="text-sm font-medium">
                    {formatDateLabel(dateKey)}
                  </span>
                  {!isEditable && note && (
                    <span
                      className="truncate text-sm text-muted-foreground"
                      title={note}
                    >
                      {note}
                    </span>
                  )}
                </div>
                {isEditable && !isFuture && (
                  <div className="flex flex-row items-center gap-1">
                    <DailyStatusButtons
                      currentStatus={status}
                      disabled={mutation.isPending}
                      onChange={newStatus => mutation.mutate({
                        kind: "status",
                        dateKey,
                        status: newStatus,
                      })}
                      iconOnly
                    />
                    <NoteEditButton
                      initialNote={note}
                      disabled={mutation.isPending}
                      onSave={newNote => mutation.mutate({
                        kind: "note",
                        dateKey,
                        note: newNote,
                      })}
                    />
                    {hasStatusEntry
                      ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({
                            kind: "status",
                            dateKey,
                            status: null,
                          })}
                          className="
                            text-destructive opacity-0
                            group-focus-within:opacity-100
                            group-hover:opacity-100
                          "
                          title="Delete entry"
                          aria-label="Delete entry"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      )
                      : (
                        <div
                          aria-hidden
                          className="size-8"
                        />
                      )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
