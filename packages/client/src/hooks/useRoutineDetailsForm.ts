import type { LocalConnectionType } from "@/utils";
import type { RoutineConnection, Routine, TaskBookmark } from "@emstack/types";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import {
  curatedDateRange,
  curatedToRows,
  fillAllDays,
  MAX_CURATED_DAYS,
  representativeRow,
  rowsToCurated,
  rowsToWeekly,
  weeklyToRows,
} from "@/components/routines";
import { NAME_MAX_LENGTH } from "@/constants/stringLimits";
import { useFormChangeState } from "@/hooks/useFormChangeState";
import {
  buildConnectionOptions,
  decodeConnection,
  encodeConnection,
  fetchTasks,
  getDateKey,
  getTodayKey,
  toOptions,
  upsertRoutine,
} from "@/utils";

const scheduleRowFields = {
  type: z.enum(["", "task", "freeform", "bookmark"]),
  id: z.string(),
  notes: z.string(),
  location: z.string(),
  prependText: z.string(),
  appendText: z.string(),
  title: z.string(),
  url: z.string(),
  sectionId: z.string(),
  sectionLabel: z.string(),
} as const;

const weeklyRowSchema = z
  .object({
    day: z.enum(["0", "1", "2", "3", "4", "5", "6"]),
    ...scheduleRowFields,
  })
  .refine(row => row.type === "" || row.id.length > 0, {
    message: "Required",
    path: ["id"],
  });

const curatedRowSchema = z
  .object({
    date: z.string(),
    ...scheduleRowFields,
  })
  .refine(row => row.type === "" || row.id.length > 0, {
    message: "Required",
    path: ["id"],
  });

const detailsSchema = z.object({
  name: z.string().min(1, "Name is required").max(NAME_MAX_LENGTH),
  description: z.string().max(2000),
  connections: z.array(z.string()),
  // Bookmark connections are managed by a separate async picker (search/create),
  // not the preloaded connections multi-select; merged into `connections` on save.
  bookmarks: z.array(
    z.object({
      id: z.string().optional(),
      bookmarkId: z.string(),
      title: z.string(),
      url: z.string().nullable(),
      sectionId: z.string().nullable().optional(),
      sectionLabel: z.string().nullable().optional(),
      position: z.number().nullable().optional(),
    }),
  ),
  status: z.enum(["active", "inactive", "complete", "paused"]),
  mode: z.enum(["weekly", "daily", "curated"]),
  weekly: z.array(weeklyRowSchema).length(7),
  // Curated-mode only: the chosen end date (≤ 14 days out) and a row per date
  // from today through it. Date stored as a Date for the picker; null = unset.
  curatedEndDate: z.date().nullable(),
  curated: z.array(curatedRowSchema),
  // Daily-mode only: how many days a week the routine needs doing. Null = no
  // target (every day).
  weeklyTarget: z.number().int().min(1).max(7).nullable(),
});

function keyToDate(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

/**
 * Bundles the Details tab's data layer: the tasks/resources queries and
 * their derived combobox options, plus the change-tracked save form. Keeps the
 * tab component presentational.
 */
export function useRoutineDetailsForm(
  routine: Routine,
  onSaved: () => Promise<void>,
  onChangeStateChange?: (hasChanges: boolean) => void,
) {
  const {
    data: tasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const taskOptions = useMemo(() => toOptions(tasks), [tasks]);
  const connectionOptions = useMemo(
    () => buildConnectionOptions(tasks),
    [tasks],
  );

  const todayKey = getTodayKey();

  const startingValues = useMemo(() => {
    const curatedEndKey = routine.curated?.endDate ?? null;
    const allConnections = routine.connections ?? [];
    return {
      name: routine.name ?? "",
      description: routine.description ?? "",
      connections: allConnections
        .filter(
          (c): c is RoutineConnection & { type: LocalConnectionType } =>
            c.type !== "bookmark",
        )
        .map(encodeConnection),
      bookmarks: allConnections
        .filter(c => c.type === "bookmark")
        .map(
          (c): TaskBookmark => ({
            bookmarkId: c.id,
            title: c.name ?? "",
            url: c.url ?? null,
            sectionId: c.sectionId ?? null,
            sectionLabel: c.sectionLabel ?? null,
          }),
        ),
      status: routine.status ?? "active",
      mode: routine.mode ?? "weekly",
      weekly: weeklyToRows(routine.weekly),
      curatedEndDate: curatedEndKey ? keyToDate(curatedEndKey) : null,
      curated: curatedToRows(
        routine.curated,
        curatedDateRange(todayKey, curatedEndKey),
      ),
      weeklyTarget: routine.weeklyTarget ?? null,
    };
  }, [routine, todayKey]);

  const [isSaving, setIsSaving] = useState(false);

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: detailsSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        const localConnections = value.connections
          .map(decodeConnection)
          .filter((c): c is NonNullable<typeof c> => c !== null);
        // Bookmark connections carry their cached title/url so the server can
        // store them (no local row to resolve on read).
        const bookmarkConnections: RoutineConnection[] = value.bookmarks.map(
          b => ({
            type: "bookmark",
            id: b.bookmarkId,
            name: b.title,
            url: b.url,
            sectionId: b.sectionId ?? null,
            sectionLabel: b.sectionLabel ?? null,
          }),
        );
        const connections = [...localConnections, ...bookmarkConnections];

        await upsertRoutine(routine.id, {
          name: value.name,
          description: value.description || null,
          connections,
          status: value.status,
          mode: value.mode,
          // Daily mode mirrors the single chosen entry onto all 7 days so
          // "today's item" resolves identically every day. Curated mode keys by
          // date instead, so its weekly grid is cleared.
          weekly:
            value.mode === "daily"
              ? rowsToWeekly(fillAllDays(representativeRow(value.weekly)))
              : value.mode === "curated"
                ? {}
                : rowsToWeekly(value.weekly),
          // Curated schedule (date-keyed); cleared for weekly/daily routines.
          curated:
            value.mode === "curated"
              ? rowsToCurated(
                value.curated,
                value.curatedEndDate
                  ? getDateKey(value.curatedEndDate)
                  : null,
              )
              : {
                endDate: null,
                entries: {},
              },
          // The weekly target only applies to daily routines; clear it for
          // weekly and curated schedules.
          weeklyTarget: value.mode === "daily" ? value.weeklyTarget : null,
        });
        onChangeStateChange?.(false);
        await onSaved();
        toast.success("Details saved.");
      }
      catch {
        toast.error("Failed to save details.");
      }
      finally {
        setIsSaving(false);
      }
    },
  });

  const {
    currentValues, hasChanges,
  } = useFormChangeState(
    form,
    startingValues,
  );
  const isDaily = currentValues.mode === "daily";
  const isCurated = currentValues.mode === "curated";

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

  // Selectable curated window: today through today + 14 days. Memoized so the
  // picker's disabled matcher is referentially stable.
  const curatedWindow = useMemo(() => {
    const min = keyToDate(todayKey);
    const max = keyToDate(todayKey);
    max.setDate(max.getDate() + MAX_CURATED_DAYS);
    return {
      min,
      max,
    };
  }, [todayKey]);

  // Apply a new curated end date, regenerating the per-date rows for the new
  // range while preserving any edits the user already made to dates still in it.
  function setCuratedEndDate(date: Date | null) {
    form.setFieldValue("curatedEndDate", date);
    const endKey = date ? getDateKey(date) : null;
    const keys = curatedDateRange(todayKey, endKey);
    const existing = new Map(
      form.getFieldValue("curated").map(r => [r.date, r]),
    );
    form.setFieldValue(
      "curated",
      keys.map(
        key =>
          existing.get(key) ?? {
            date: key,
            type: "" as const,
            id: "",
            notes: "",
            location: "",
            prependText: "",
            appendText: "",
            title: "",
            url: "",
            sectionId: "",
            sectionLabel: "",
          },
      ),
    );
  }

  return {
    form,
    connectionOptions,
    taskOptions,
    isDaily,
    isCurated,
    curatedWindow,
    setCuratedEndDate,
    isSaving,
  };
}
