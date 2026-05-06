import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Trash2Icon } from "lucide-react";
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
  upsertDaily,
  withCompletion,
} from "@/utils";

interface DailyCompletionsManagerProps {
  daily: Daily;
}

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

export function DailyCompletionsManager({
  daily,
}: DailyCompletionsManagerProps) {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const sortedCompletions = [...daily.completions].sort((a, b) =>
    a.date < b.date ? 1 : -1);

  const selectedStatus
    = daily.completions.find(c => c.date === selectedDateKey)?.status ?? null;

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
        <h3 className="text-lg font-semibold">Logged entries</h3>
        {sortedCompletions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <i>No entries logged yet.</i>
          </p>
        )}
        {sortedCompletions.length > 0 && (
          <ul className="flex flex-col divide-y rounded-md border">
            {sortedCompletions.map(c => (
              <li
                key={c.date}
                className={cn(
                  `
                    flex flex-row flex-wrap items-center justify-between gap-2
                    p-2
                  `,
                  c.date === selectedDateKey && "bg-muted/40",
                )}
              >
                <button
                  type="button"
                  className="
                    flex flex-row items-center gap-2 text-left
                    hover:underline
                  "
                  onClick={() => setSelectedDateKey(c.date)}
                >
                  <DailyStatusCircle
                    status={c.status}
                    size="sm"
                  />
                  <span className="text-sm font-medium">
                    {formatDateLabel(c.date)}
                  </span>
                  {c.date === todayKey && (
                    <span
                      className="
                        rounded-sm bg-muted px-1.5 py-0.5 text-xs
                        text-muted-foreground uppercase
                      "
                    >
                      today
                    </span>
                  )}
                </button>
                <div className="flex flex-row items-center gap-1">
                  <DailyStatusButtons
                    currentStatus={c.status}
                    disabled={mutation.isPending}
                    onChange={status => mutation.mutate({
                      dateKey: c.date,
                      status,
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({
                      dateKey: c.date,
                      status: null,
                    })}
                    className="text-destructive"
                    title="Delete entry"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
