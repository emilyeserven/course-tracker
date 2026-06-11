import type {
  Daily,
  RoutineMode,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

import { ActionableSentence } from "./ActionableSentence";

// Date.getDay() order ("0" = Sunday … "6" = Saturday); mirrors the middleware's
// representativeEntry scan so the "first scheduled day" fallback matches the API.
const DAY_KEYS: RoutineWeekday[] = ["0", "1", "2", "3", "4", "5", "6"];

// The first scheduled day's note, used as a fallback when today has no entry.
function firstPopulatedNote(
  weekly: RoutineWeekly | null | undefined,
): string | null {
  if (!weekly) {
    return null;
  }
  for (const key of DAY_KEYS) {
    const note = weekly[key]?.notes;
    if (note) {
      return note;
    }
  }
  return null;
}

// The action name (the assigned task/resource/freeform the routine points at,
// with any prepend/append affixes) on top, and a smaller, de-emphasized subtitle
// beneath it. The subtitle is the routine's description for daily-mode routines,
// or the scheduled note (today's day-of-week entry, falling back to the first
// scheduled day) for weekly-mode routines. It is omitted when empty, so a daily
// with no description — or a weekly routine with no notes — stays a single line.
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

  const todayWeekday = String(new Date().getDay()) as RoutineWeekday;
  const weeklyNote
    = routineView.weekly?.[todayWeekday]?.notes
      ?? firstPopulatedNote(routineView.weekly);
  const subtitle
    = routineView.mode === "weekly" ? weeklyNote : (daily.description ?? null);
  const showSubtitle = subtitle != null && subtitle !== "";

  return (
    <span className="flex flex-col">
      <ActionableSentence
        prependText={daily.actionParts?.prependText}
        appendText={daily.actionParts?.appendText}
        name={daily.actionParts?.name ?? daily.name}
      />
      {showSubtitle && (
        <span className="text-xs font-normal text-muted-foreground">
          {subtitle}
        </span>
      )}
    </span>
  );
}
