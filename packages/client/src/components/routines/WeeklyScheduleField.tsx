import type { WeeklyRow, WeeklyRowType } from "@/components/routines/weekly";
import type { RoutineWeekday } from "@emstack/types/src";

import { useMemo } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/combobox";
import { DAY_LABELS, DAY_ORDER } from "@/components/routines/weekly";

interface ItemOption {
  value: string;
  label: string;
}

interface WeeklyScheduleFieldProps {
  value: WeeklyRow[];
  onChange: (next: WeeklyRow[]) => void;
  taskOptions: ItemOption[];
  resourceOptions: ItemOption[];
}

export function WeeklyScheduleField({
  value,
  onChange,
  taskOptions,
  resourceOptions,
}: WeeklyScheduleFieldProps) {
  const rowsByDay = useMemo(
    () => new Map(value.map(r => [r.day, r])),
    [value],
  );

  function update(day: RoutineWeekday, patch: Partial<WeeklyRow>) {
    onChange(value.map(r => (r.day === day
      ? {
        ...r,
        ...patch,
      }
      : r)));
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {DAY_ORDER.map((day) => {
          const row = rowsByDay.get(day) ?? {
            day,
            type: "" as WeeklyRowType,
            id: "",
          };
          const itemOptions
            = row.type === "task"
              ? taskOptions
              : row.type === "resource"
                ? resourceOptions
                : [];
          const optionsMap = new Map(itemOptions.map(o => [o.value, o.label]));

          return (
            <li
              key={day}
              className="
                grid grid-cols-[110px_140px_1fr] items-center gap-2 rounded-md
                border bg-background px-2 py-1.5
              "
            >
              <span className="text-sm font-medium">{DAY_LABELS[day]}</span>

              <select
                aria-label={`${DAY_LABELS[day]} type`}
                value={row.type}
                onChange={(e) => {
                  // Changing the type clears the chosen item (different
                  // option set).
                  update(day, {
                    type: e.target.value as WeeklyRowType,
                    id: "",
                  });
                }}
                className="
                  flex h-9 w-full rounded-md border bg-background px-2 text-sm
                "
              >
                <option value="">— None —</option>
                <option value="task">Task</option>
                <option value="resource">Resource</option>
                <option value="freeform">Freeform</option>
              </select>

              {row.type === "freeform"
                ? (
                  <input
                    aria-label={`${DAY_LABELS[day]} description`}
                    value={row.id}
                    onChange={e => update(day, {
                      id: e.target.value,
                    })}
                    placeholder="Describe the activity…"
                    className="
                      flex h-9 w-full rounded-md border bg-background px-2
                      text-sm
                    "
                  />
                )
                : (
                  <Combobox
                    items={itemOptions.map(o => o.value)}
                    value={row.id || null}
                    onValueChange={val => update(day, {
                      id: val ?? "",
                    })}
                    itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
                  >
                    <ComboboxInput
                      placeholder={
                        row.type === "task"
                          ? "Search tasks..."
                          : row.type === "resource"
                            ? "Search resources..."
                            : "Pick a type first"
                      }
                      showClear
                      disabled={!row.type}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No items found.</ComboboxEmpty>
                      <ComboboxList>
                        {(val: string) => (
                          <ComboboxItem
                            key={val}
                            value={val}
                          >
                            {optionsMap.get(val) ?? val}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
