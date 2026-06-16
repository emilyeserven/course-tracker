import type { WeeklyRow } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";
import type { RoutineWeekday } from "@emstack/types";

import { useMemo, useState } from "react";

import { QuickAddResourceDialog } from "@/components/dialogs/quickAdd/QuickAddResourceDialog";
import { ScheduleEntryRow } from "@/components/routines/ScheduleEntryRow";
import {
  DAY_LABELS,
  DAY_ORDER,
  rowNarrowingOptions,
} from "@/components/routines/weekly";

interface WeeklyScheduleFieldProps {
  value: WeeklyRow[];
  onChange: (next: WeeklyRow[]) => void;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
  // Per-resource module groups / modules, keyed by resource id, for narrowing a
  // resource entry.
  moduleGroupsByResource: Map<string, SelectOption[]>;
  modulesByResource: Map<string, SelectOption[]>;
}

export function WeeklyScheduleField({
  value,
  onChange,
  taskOptions,
  resourceOptions,
  moduleGroupsByResource,
  modulesByResource,
}: WeeklyScheduleFieldProps) {
  const rowsByDay = useMemo(
    () => new Map(value.map(r => [r.day, r])),
    [value],
  );

  // Inline "Add resource" modal — shared across days; only one combobox dropdown
  // is open at a time, so a single typed-text value and target day are enough.
  const [addOpen, setAddOpen] = useState(false);
  const [addForDay, setAddForDay] = useState<RoutineWeekday | null>(null);
  const [inputValue, setInputValue] = useState("");

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
            moduleId: "",
            moduleGroupId: "",
            notes: "",
            location: "",
            prependText: "",
            appendText: "",
          };
          const {
            groupOptions, moduleOptions,
          } = rowNarrowingOptions(
            row,
            moduleGroupsByResource,
            modulesByResource,
          );
          return (
            <ScheduleEntryRow
              key={day}
              label={DAY_LABELS[day]}
              ariaPrefix={DAY_LABELS[day]}
              row={row}
              taskOptions={taskOptions}
              resourceOptions={resourceOptions}
              groupOptions={groupOptions}
              moduleOptions={moduleOptions}
              onChange={patch => update(day, patch)}
              onInputValueChange={setInputValue}
              onAddResource={() => {
                setAddForDay(day);
                setAddOpen(true);
              }}
            />
          );
        })}
      </ul>

      <QuickAddResourceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialName={inputValue}
        onCreated={(newId) => {
          if (addForDay != null) {
            update(addForDay, {
              id: newId,
            });
          }
        }}
      />
    </div>
  );
}
