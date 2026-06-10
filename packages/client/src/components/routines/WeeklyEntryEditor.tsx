import type { WeeklyRowType } from "@/components/routines/weekly";

import { useMemo } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/combobox";

interface ItemOption {
  value: string;
  label: string;
}

interface WeeklyEntryEditorProps {
  type: WeeklyRowType;
  id: string;
  onChange: (next: { type: WeeklyRowType;
    id: string; }) => void;
  taskOptions: ItemOption[];
  resourceOptions: ItemOption[];
}

// A single task / resource / freeform picker — the same control the weekly grid
// uses per day, but standalone for Daily Task mode (the chosen entry is applied
// to every weekday).
export function WeeklyEntryEditor({
  type,
  id,
  onChange,
  taskOptions,
  resourceOptions,
}: WeeklyEntryEditorProps) {
  const itemOptions
    = type === "task"
      ? taskOptions
      : type === "resource"
        ? resourceOptions
        : [];
  const optionsMap = useMemo(
    () => new Map(itemOptions.map(o => [o.value, o.label])),
    [itemOptions],
  );

  return (
    <div
      className="
        grid grid-cols-[140px_1fr] items-center gap-2 rounded-md border
        bg-background px-2 py-1.5
      "
    >
      <select
        aria-label="Daily task type"
        value={type}
        onChange={e =>
          onChange({
            type: e.target.value as WeeklyRowType,
            id: "",
          })}
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">— None —</option>
        <option value="task">Task</option>
        <option value="resource">Resource</option>
        <option value="freeform">Freeform</option>
      </select>

      {type === "freeform"
        ? (
          <input
            aria-label="Daily task description"
            value={id}
            onChange={e =>
              onChange({
                type,
                id: e.target.value,
              })}
            placeholder="Describe the activity…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
        )
        : (
          <Combobox
            items={itemOptions.map(o => o.value)}
            value={id || null}
            onValueChange={val =>
              onChange({
                type,
                id: val ?? "",
              })}
            itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
          >
            <ComboboxInput
              placeholder={
                type === "task"
                  ? "Search tasks..."
                  : type === "resource"
                    ? "Search resources..."
                    : "Pick a type first"
              }
              showClear
              disabled={!type}
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
    </div>
  );
}
