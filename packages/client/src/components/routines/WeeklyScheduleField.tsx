import type { WeeklyRow } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";
import type { RoutineWeekday } from "@emstack/types";

import { useMemo } from "react";

import { ScheduleEntryRow } from "@/components/routines/ScheduleEntryRow";
import { DAY_LABELS, DAY_ORDER } from "@/components/routines/weekly";

interface WeeklyScheduleFieldProps {
  value: WeeklyRow[];
  onChange: (next: WeeklyRow[]) => void;
  taskOptions: SelectOption[];
}

export function WeeklyScheduleField({
  value,
  onChange,
  taskOptions,
}: WeeklyScheduleFieldProps) {
  const rowsByDay = useMemo(
    () => new Map(value.map(r => [r.day, r])),
    [value],
  );

  function update(day: RoutineWeekday, patch: Partial<WeeklyRow>) {
    onChange(
      value.map(r =>
        r.day === day
          ? {
            ...r,
            ...patch,
          }
          : r),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {DAY_ORDER.map((day) => {
          const row = rowsByDay.get(day) ?? {
            day,
            type: "" as WeeklyRow["type"],
            id: "",
            notes: "",
            location: "",
            prependText: "",
            appendText: "",
            title: "",
            url: "",
            sectionId: "",
            sectionLabel: "",
          };
          return (
            <ScheduleEntryRow
              key={day}
              label={DAY_LABELS[day]}
              ariaPrefix={DAY_LABELS[day]}
              row={row}
              taskOptions={taskOptions}
              onChange={patch => update(day, patch)}
            />
          );
        })}
      </ul>
    </div>
  );
}
