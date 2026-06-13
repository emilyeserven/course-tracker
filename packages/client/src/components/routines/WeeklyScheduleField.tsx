import type { WeeklyRow, WeeklyRowType } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";
import type { RoutineWeekday } from "@emstack/types";

import { useMemo, useState } from "react";

import { buildActionableSentence } from "@emstack/types";

import { Combobox, ComboboxInput } from "@/components/combobox";
import { QuickAddResourceDialog } from "@/components/quickAdd/QuickAddResourceDialog";
import { TaskResourceComboboxContent } from "@/components/routines/TaskResourceComboboxContent";
import { DAY_LABELS, DAY_ORDER } from "@/components/routines/weekly";

interface WeeklyScheduleFieldProps {
  value: WeeklyRow[];
  onChange: (next: WeeklyRow[]) => void;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
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
            type: "" as WeeklyRowType,
            id: "",
            notes: "",
            location: "",
            prependText: "",
            appendText: "",
          };
          const itemOptions
            = row.type === "task"
              ? taskOptions
              : row.type === "resource"
                ? resourceOptions
                : [];
          const optionsMap = new Map(
            itemOptions.map(o => [o.value, o.label]),
          );
          const itemName
            = row.type === "freeform" ? row.id : (optionsMap.get(row.id) ?? "");
          const showPreview
            = !!itemName && (!!row.prependText.trim() || !!row.appendText.trim());
          const preview = buildActionableSentence({
            prependText: row.prependText,
            name: itemName,
            appendText: row.appendText,
          });

          return (
            <li
              key={day}
              className="
                flex flex-col gap-1.5 rounded-md border bg-background px-2
                py-1.5
              "
            >
              <div
                className="grid grid-cols-[110px_140px_1fr] items-center gap-2"
              >
                <span className="text-sm font-medium">{DAY_LABELS[day]}</span>

                <select
                  aria-label={`${DAY_LABELS[day]} type`}
                  value={row.type}
                  onChange={(e) => {
                    // Changing the type clears the chosen item (different
                    // option set) and any note/location.
                    update(day, {
                      type: e.target.value as WeeklyRowType,
                      id: "",
                      notes: "",
                      location: "",
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
                      onChange={e =>
                        update(day, {
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
                      onValueChange={val =>
                        update(day, {
                          id: val ?? "",
                        })}
                      onInputValueChange={val => setInputValue(val)}
                      itemToStringLabel={(val: string) =>
                        optionsMap.get(val) ?? ""}
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
                      <TaskResourceComboboxContent
                        optionsMap={optionsMap}
                        onAddNew={
                          row.type === "resource"
                            ? () => {
                              setAddForDay(day);
                              setAddOpen(true);
                            }
                            : undefined
                        }
                      />
                    </Combobox>
                  )}
              </div>

              {row.type !== "" && (
                <>
                  <input
                    aria-label={`${DAY_LABELS[day]} notes`}
                    value={row.notes}
                    onChange={e =>
                      update(day, {
                        notes: e.target.value,
                      })}
                    placeholder="Notes (optional)…"
                    className="
                      flex h-9 w-full rounded-md border bg-background px-2
                      text-sm
                    "
                  />
                  <input
                    aria-label={`${DAY_LABELS[day]} location`}
                    value={row.location}
                    onChange={e =>
                      update(day, {
                        location: e.target.value,
                      })}
                    placeholder="Location (e.g. gym, Spanish app, or a URL)…"
                    className="
                      flex h-9 w-full rounded-md border bg-background px-2
                      text-sm
                    "
                  />
                  <div
                    className="
                      grid grid-cols-1 gap-1.5
                      sm:grid-cols-2
                    "
                  >
                    <input
                      aria-label={`${DAY_LABELS[day]} prepend text`}
                      value={row.prependText}
                      onChange={e =>
                        update(day, {
                          prependText: e.target.value,
                        })}
                      placeholder="Prepend text (e.g. Review)…"
                      className="
                        flex h-9 w-full rounded-md border bg-background px-2
                        text-sm
                      "
                    />
                    <input
                      aria-label={`${DAY_LABELS[day]} append text`}
                      value={row.appendText}
                      onChange={e =>
                        update(day, {
                          appendText: e.target.value,
                        })}
                      placeholder="Append text (e.g. for 10 minutes)…"
                      className="
                        flex h-9 w-full rounded-md border bg-background px-2
                        text-sm
                      "
                    />
                  </div>
                  {showPreview && (
                    <p className="px-0.5 text-sm text-muted-foreground">
                      Preview:
                      {" "}
                      <span className="text-foreground">{preview}</span>
                    </p>
                  )}
                </>
              )}
            </li>
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
