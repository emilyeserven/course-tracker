import type { WeeklyRowType } from "@/components/routines/weekly";

import { useMemo } from "react";

import { buildActionableSentence } from "@emstack/types";

import {
  Combobox,
  ComboboxInput,
} from "@/components/combobox";
import { TaskResourceComboboxContent } from "@/components/routines/TaskResourceComboboxContent";

interface ItemOption {
  value: string;
  label: string;
}

interface EntryValue {
  type: WeeklyRowType;
  id: string;
  notes: string;
  location: string;
  prependText: string;
  appendText: string;
}

interface WeeklyEntryEditorProps extends EntryValue {
  onChange: (next: EntryValue) => void;
  taskOptions: ItemOption[];
  resourceOptions: ItemOption[];
}

// A single task / resource / freeform picker — the same control the weekly grid
// uses per day, but standalone for Daily Task mode (the chosen entry is applied
// to every weekday). Also carries the optional note and prepend/append text that
// build the daily's actionable sentence.
export function WeeklyEntryEditor({
  type,
  id,
  notes,
  location,
  prependText,
  appendText,
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

  function emit(patch: Partial<EntryValue>) {
    onChange({
      type,
      id,
      notes,
      location,
      prependText,
      appendText,
      ...patch,
    });
  }

  const itemName = type === "freeform" ? id : optionsMap.get(id) ?? "";
  const showPreview
    = !!itemName && (!!prependText.trim() || !!appendText.trim());
  const preview = buildActionableSentence({
    prependText,
    name: itemName,
    appendText,
  });

  return (
    <div
      className="
        flex flex-col gap-1.5 rounded-md border bg-background px-2 py-1.5
      "
    >
      <div className="grid grid-cols-[140px_1fr] items-center gap-2">
        <select
          aria-label="Daily task type"
          value={type}
          onChange={e =>
            // Changing the type clears the chosen item (different option set)
            // and any note/location/prepend/append.
            emit({
              type: e.target.value as WeeklyRowType,
              id: "",
              notes: "",
              location: "",
              prependText: "",
              appendText: "",
            })}
          className="
            flex h-9 w-full rounded-md border bg-background px-2 text-sm
          "
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
                emit({
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
                emit({
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
              <TaskResourceComboboxContent optionsMap={optionsMap} />
            </Combobox>
          )}
      </div>

      {type !== "" && (
        <>
          <input
            aria-label="Daily task notes"
            value={notes}
            onChange={e =>
              emit({
                notes: e.target.value,
              })}
            placeholder="Notes (optional)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          <input
            aria-label="Daily task location"
            value={location}
            onChange={e =>
              emit({
                location: e.target.value,
              })}
            placeholder="Location (e.g. gym, Spanish app, or a URL)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          <div
            className="
              grid grid-cols-1 gap-1.5
              sm:grid-cols-2
            "
          >
            <input
              aria-label="Prepend text"
              value={prependText}
              onChange={e =>
                emit({
                  prependText: e.target.value,
                })}
              placeholder="Prepend text (e.g. Review)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
            <input
              aria-label="Append text"
              value={appendText}
              onChange={e =>
                emit({
                  appendText: e.target.value,
                })}
              placeholder="Append text (e.g. for 10 minutes)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
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
    </div>
  );
}
