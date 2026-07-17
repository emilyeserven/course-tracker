import type { RoutineReferenceItem } from "@emstack/types";

import { RoutineEntryLabel } from "@/components/routines";
import { cn } from "@/lib/utils";

export interface ScheduleEntryListRow {
  key: string;
  label: string;
  entry: RoutineReferenceItem | undefined;
}

interface RoutineScheduleEntryListProps {
  rows: ScheduleEntryListRow[];
  // Resolves task ids referenced by schedule entries.
  taskNames: Map<string, string>;
  // Literal Tailwind grid template so both label widths stay statically
  // analyzable ("grid-cols-[120px_1fr]" for weekdays, wider for dates).
  gridClass: string;
}

// One label + scheduled-entry row per line, shared by the weekly (per-weekday)
// and curated (per-date) schedule sections of the routine Details tab.
export function RoutineScheduleEntryList({
  rows,
  taskNames,
  gridClass,
}: RoutineScheduleEntryListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {rows.map(({
        key, label, entry,
      }) => (
        <li
          key={key}
          className={cn(
            "items-center gap-2 border-b border-border/60 py-1",
            gridClass,
          )}
        >
          <span className="text-sm font-medium">{label}</span>
          {entry
            ? (
              <RoutineEntryLabel
                entry={entry}
                taskNames={taskNames}
              />
            )
            : (
              <span className="text-sm text-muted-foreground italic">
                Nothing scheduled
              </span>
            )}
        </li>
      ))}
    </ul>
  );
}
