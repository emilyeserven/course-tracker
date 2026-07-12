import type { ViewMonth } from "@/components/dailies/MonthYearPicker";
import type {
  Daily,
  DailyCompletionEntryParts,
  DailyCompletionStatus,
  RoutineReferenceItem,
  RoutineWeekday,
} from "@emstack/types";

import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import {
  getReferenceDateKey,
  getTodayKey,
  shiftDateKey,
  upsertDaily,
  withCompletion,
  withCompletionNote,
} from "@/utils";

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

// Day-of-week key for a UTC date key, matching RoutineWeekday ("0" = Sunday …
// "6" = Saturday) so it can index a routine's `weekly` grid.
function weekdayKey(dateKey: string): RoutineWeekday {
  return String(new Date(`${dateKey}T00:00:00Z`).getUTCDay()) as RoutineWeekday;
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

/** A single date row of the completions list, pre-derived for rendering. */
export interface DailyCompletionRow {
  dateKey: string;
  status: DailyCompletionStatus | null;
  note: string | null;
  dateLabel: string;
  hasStatusEntry: boolean;
  isFuture: boolean;
  isToday: boolean;
  hasActions: boolean;
  isExpanded: boolean;
  showVerticalConnector: boolean;
  nextStatus: DailyCompletionStatus | null;
  // The live scheduled entry for this date (weekly → weekday, curated → date),
  // used as a fallback when the completion has no baked snapshot.
  scheduledEntry: RoutineReferenceItem | null;
  // The frozen schedule snapshot baked onto the completion at save time. When
  // present it takes precedence over scheduledEntry (the name is already
  // resolved, so the log keeps reading correctly even if the schedule changes).
  bakedParts: DailyCompletionEntryParts | null;
}

/**
 * Calendar / log / mutation logic for {@link DailyCompletionsManager}, mirroring
 * the bundled-hook pattern of `useResourceModules`. Owns month navigation, the
 * visible-date window, weekly-schedule name resolution, and the upsert mutation,
 * returning a presentational-ready shape so the component renders only JSX.
 */
export function useDailyCompletions(daily: Daily, readOnly = false) {
  const queryClient = useQueryClient();
  const isComplete = daily.status === "complete";
  const effectiveReadOnly = readOnly || isComplete;
  const todayKey = getReferenceDateKey(daily);
  const realToday = getTodayKey();
  const currentMonth = getMonthFromKey(todayKey);

  const [viewMonth, setViewMonth] = useState<ViewMonth>(currentMonth);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [expandedDateKey, setExpandedDateKey] = useState<string | null>(null);

  // Weekly routines schedule a different item per weekday and curated routines
  // per date; surface that item on each date row. The grids carry unresolved
  // ids, so resolve task names from the (already cached) list.
  const isWeekly = daily.mode === "weekly";
  const isCurated = daily.mode === "curated";
  const weekly = daily.weekly ?? {};
  const curatedEntries = daily.curated?.entries ?? {};

  const {
    taskNames,
  } = useTaskResourceNames(isWeekly || isCurated);

  const completionsByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        status: DailyCompletionStatus | null;
        note: string | null;
        entryParts: DailyCompletionEntryParts | null;
      }
    >();
    for (const c of daily.completions) {
      map.set(c.date, {
        status: c.status ?? null,
        note: c.note ?? null,
        entryParts: c.entryParts ?? null,
      });
    }
    return map;
  }, [daily.completions]);

  const visibleDateKeys = useMemo(
    () => buildVisibleDateKeys(viewMonth, currentMonth, todayKey),
    [viewMonth, currentMonth, todayKey],
  );

  const rows = useMemo<DailyCompletionRow[]>(
    () =>
      visibleDateKeys.map((dateKey, i) => {
        const entry = completionsByDate.get(dateKey);
        const status = entry?.status ?? null;
        const isToday = dateKey === realToday;
        const isFuture = dateKey > realToday;
        const isEditable = isToday || !effectiveReadOnly;
        const nextDateKey = visibleDateKeys[i + 1];
        const nextStatus = nextDateKey
          ? (completionsByDate.get(nextDateKey)?.status ?? null)
          : null;
        return {
          dateKey,
          status,
          note: entry?.note ?? null,
          dateLabel: formatDateLabel(dateKey),
          hasStatusEntry: status !== null,
          isFuture,
          isToday,
          hasActions: isEditable && !isFuture,
          isExpanded: expandedDateKey === dateKey,
          showVerticalConnector: status !== null && nextStatus !== null,
          nextStatus,
          scheduledEntry: isWeekly
            ? (weekly[weekdayKey(dateKey)] ?? null)
            : isCurated
              ? (curatedEntries[dateKey] ?? null)
              : null,
          bakedParts: entry?.entryParts ?? null,
        };
      }),
    [
      visibleDateKeys,
      completionsByDate,
      realToday,
      effectiveReadOnly,
      expandedDateKey,
      isWeekly,
      isCurated,
      weekly,
      curatedEntries,
    ],
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
      // Recent re-updates re-bake to the current schedule; older entries
      // (beyond REBAKE_WINDOW_DAYS) keep their frozen snapshot.
      const completions
        = args.kind === "status"
          ? withCompletion(daily, args.dateKey, args.status, realToday)
          : withCompletionNote(daily, args.dateKey, args.note);
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["daily", daily.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["routine", daily.id],
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
  const monthLabel = isCurrentMonth
    ? isComplete
      ? "Last 30 days (final)"
      : "Last 30 days"
    : formatMonthLabel(viewMonth.year, viewMonth.month);

  return {
    effectiveReadOnly,
    isComplete,
    earliestYear: EARLIEST_PICKER_YEAR,

    viewMonth,
    currentMonth,
    isCurrentMonth,
    monthLabel,
    monthPickerOpen,
    setMonthPickerOpen,
    selectMonth: (m: ViewMonth) => {
      setViewMonth(m);
      setMonthPickerOpen(false);
    },
    goToPrevMonth: () => setViewMonth(m => shiftMonth(m, -1)),
    goToNextMonth: () => setViewMonth(m => shiftMonth(m, 1)),
    canGoPrev: shiftMonth(viewMonth, -1).year >= EARLIEST_PICKER_YEAR,
    canGoNext:
      !isCurrentMonth && !isAfterMonth(shiftMonth(viewMonth, 1), currentMonth),

    toggleExpanded: (dateKey: string) =>
      setExpandedDateKey(prev => (prev === dateKey ? null : dateKey)),

    isWeekly,
    taskNames,

    rows,
    hasRows: visibleDateKeys.length > 0,

    mutationPending: mutation.isPending,
    setStatus: (dateKey: string, status: DailyCompletionStatus | null) =>
      mutation.mutate({
        kind: "status",
        dateKey,
        status,
      }),
    setNote: (dateKey: string, note: string | null) =>
      mutation.mutate({
        kind: "note",
        dateKey,
        note,
      }),
    deleteEntry: (dateKey: string) =>
      mutation.mutate({
        kind: "status",
        dateKey,
        status: null,
      }),
  };
}
