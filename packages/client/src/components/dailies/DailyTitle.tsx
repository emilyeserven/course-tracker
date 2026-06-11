import type {
  Daily,
  RoutineMode,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

import { ActionableSentence } from "./ActionableSentence";

import { cn } from "@/lib/utils";

// The action name (the assigned task/resource/freeform the routine points at,
// with any prepend/append affixes) on top, and a smaller, de-emphasized subtitle
// beneath it. For daily-mode routines the subtitle is the routine's description.
// For weekly-mode routines the action title and subtitle both describe the
// current day of week's entry (fed by the API's projection): the scheduled note
// underneath when there is a task today, or a muted "No task for today"
// placeholder when the weekday is unscheduled. The subtitle is omitted when
// empty, so a daily with no description — or a scheduled day with no note —
// stays a single line.
export function DailyTitle({
  daily,
}: {
  daily: Daily;
}) {
  // Dailies here come from the routine projection (mapRoutineToDaily), which
  // carries the routine's mode and weekly grid even though the base Daily type
  // doesn't declare them. Read them through a narrow local view.
  const routineView = daily as Daily & {
    mode?: RoutineMode;
    weekly?: RoutineWeekly | null;
  };

  const isWeekly = routineView.mode === "weekly";
  const todayWeekday = String(new Date().getDay()) as RoutineWeekday;
  const todayEntry = isWeekly ? routineView.weekly?.[todayWeekday] : null;
  const hasTodayEntry = !!(todayEntry && todayEntry.id);

  // Weekly: today's note when scheduled, else a placeholder. Daily: description.
  const subtitle = isWeekly
    ? hasTodayEntry
      ? (todayEntry?.notes ?? null)
      : "No task for today"
    : (daily.description ?? null);
  const isPlaceholder = isWeekly && !hasTodayEntry;
  const showSubtitle = subtitle != null && subtitle !== "";

  return (
    <span className="flex flex-col">
      <ActionableSentence
        prependText={daily.actionParts?.prependText}
        appendText={daily.actionParts?.appendText}
        name={daily.actionParts?.name ?? daily.name}
      />
      {showSubtitle && (
        <span
          className={cn(
            "text-xs font-normal text-muted-foreground",
            isPlaceholder && "italic",
          )}
        >
          {subtitle}
        </span>
      )}
    </span>
  );
}
