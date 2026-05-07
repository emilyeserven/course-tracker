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

import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDateKey,
  getTodayKey,
  shiftDateKey,
  upsertDaily,
  withCompletion,
} from "@/utils";

interface DailyCompletionsManagerProps {
  daily: Daily;
}

const RECENT_DAYS_COUNT = 30;

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

interface ViewMonth {
  year: number;
  month: number;
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
}: DailyCompletionsManagerProps) {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const currentMonth = getMonthFromKey(todayKey);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<ViewMonth>(currentMonth);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const completionsByDate = useMemo(() => {
    const map = new Map<string, DailyCompletionStatus>();
    for (const c of daily.completions) {
      map.set(c.date, c.status);
    }
    return map;
  }, [daily.completions]);

  const selectedStatus = completionsByDate.get(selectedDateKey) ?? null;

  const visibleDateKeys = useMemo(
    () => buildVisibleDateKeys(viewMonth, currentMonth, todayKey),
    [viewMonth, currentMonth, todayKey],
  );

  const mutation = useMutation({
    mutationFn: ({
      dateKey, status,
    }: { dateKey: string;
      status: DailyCompletionStatus | null; }) => {
      const completions = withCompletion(daily, dateKey, status);
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

  const selectedDate = new Date(`${selectedDateKey}T00:00:00Z`);
  const viewMonthDate = new Date(Date.UTC(viewMonth.year, viewMonth.month, 1));
  const isCurrentMonth = isSameMonth(viewMonth, currentMonth);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Set status for a date</h3>
        <div className="flex flex-row flex-wrap items-center gap-2">
          <Popover
            open={calendarOpen}
            onOpenChange={setCalendarOpen}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-[260px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 size-4" />
                {formatDateLabel(selectedDateKey)}
                {selectedDateKey === todayKey && (
                  <span
                    className="
                      ml-2 rounded-sm bg-muted px-1.5 py-0.5 text-xs
                      text-muted-foreground uppercase
                    "
                  >
                    today
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDateKey(getDateKey(date));
                    setCalendarOpen(false);
                  }
                }}
                disabled={{
                  after: new Date(),
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDateKey(todayKey)}
            disabled={selectedDateKey === todayKey}
          >
            Jump to today
          </Button>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-2">
          <DailyStatusCircle
            status={selectedStatus}
            size="md"
          />
          <DailyStatusButtons
            currentStatus={selectedStatus}
            disabled={mutation.isPending}
            onChange={status => mutation.mutate({
              dateKey: selectedDateKey,
              status,
            })}
          />
          {selectedStatus !== null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({
                dateKey: selectedDateKey,
                status: null,
              })}
              className="text-destructive"
            >
              <Trash2Icon className="size-4" />
              Clear entry
            </Button>
          )}
        </div>
      </div>

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
                <Calendar
                  mode="single"
                  month={viewMonthDate}
                  onMonthChange={(date) => {
                    setViewMonth({
                      year: date.getFullYear(),
                      month: date.getMonth(),
                    });
                  }}
                  selected={viewMonthDate}
                  onSelect={(date) => {
                    if (date) {
                      setViewMonth({
                        year: date.getFullYear(),
                        month: date.getMonth(),
                      });
                      setMonthPickerOpen(false);
                    }
                  }}
                  disabled={{
                    after: new Date(),
                  }}
                  captionLayout="dropdown"
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
              const status = completionsByDate.get(dateKey) ?? null;
              const hasEntry = status !== null;
              const isFuture = dateKey > todayKey;
              return (
                <li
                  key={dateKey}
                  className={cn(
                    `
                      flex flex-row flex-wrap items-center justify-between gap-2
                      p-2
                    `,
                    dateKey === selectedDateKey && "bg-muted/40",
                    isFuture && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    className="
                      flex flex-row items-center gap-2 text-left
                      hover:underline
                    "
                    onClick={() => setSelectedDateKey(dateKey)}
                    disabled={isFuture}
                  >
                    <DailyStatusCircle
                      status={status}
                      size="sm"
                    />
                    <span className="text-sm font-medium">
                      {formatDateLabel(dateKey)}
                    </span>
                    {dateKey === todayKey && (
                      <span
                        className="
                          rounded-sm bg-muted px-1.5 py-0.5 text-xs
                          text-muted-foreground uppercase
                        "
                      >
                        today
                      </span>
                    )}
                    {!hasEntry && !isFuture && (
                      <span
                        className="
                          rounded-sm border border-dashed
                          border-muted-foreground/40 px-1.5 py-0.5 text-xs
                          text-muted-foreground uppercase
                        "
                      >
                        Incomplete
                      </span>
                    )}
                  </button>
                  {!isFuture && (
                    <div className="flex flex-row items-center gap-1">
                      <DailyStatusButtons
                        currentStatus={status}
                        disabled={mutation.isPending}
                        onChange={newStatus => mutation.mutate({
                          dateKey,
                          status: newStatus,
                        })}
                      />
                      {hasEntry && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({
                            dateKey,
                            status: null,
                          })}
                          className="text-destructive"
                          title="Delete entry"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
