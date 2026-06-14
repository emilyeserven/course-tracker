import type { WeeklyEntry, WeeklyRowType } from "./weekly";
import type { SelectOption } from "@/utils";

import { buildActionableSentence } from "@emstack/types";

import { TaskResourceComboboxContent } from "@/components/routines/TaskResourceComboboxContent";
import { Combobox, ComboboxInput } from "@/components/ui/combobox";

interface ScheduleEntryRowProps {
  // Displayed label for the row (e.g. "Monday" or "Mon, Jun 15").
  label: string;
  // Prefix for the row's aria-labels (kept stable so tests/stories can target
  // e.g. "Monday type").
  ariaPrefix: string;
  row: WeeklyEntry;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
  onChange: (patch: Partial<WeeklyEntry>) => void;
  // Open the "add resource" dialog targeting this row.
  onAddResource: () => void;
  // Surface the combobox's typed text so the parent can seed the add dialog.
  onInputValueChange: (val: string) => void;
}

// One schedule row's editor: type select, task/resource picker (or freeform
// input), then optional notes / location / prepend / append with a live preview.
// Shared by WeeklyScheduleField (per weekday) and CuratedScheduleField (per date).
export function ScheduleEntryRow({
  label,
  ariaPrefix,
  row,
  taskOptions,
  resourceOptions,
  onChange,
  onAddResource,
  onInputValueChange,
}: ScheduleEntryRowProps) {
  const itemOptions
    = row.type === "task"
      ? taskOptions
      : row.type === "resource"
        ? resourceOptions
        : [];
  const optionsMap = new Map(itemOptions.map(o => [o.value, o.label]));
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
      className="
        flex flex-col gap-1.5 rounded-md border bg-background px-2 py-1.5
      "
    >
      <div className="grid grid-cols-[110px_140px_1fr] items-center gap-2">
        <span className="text-sm font-medium">{label}</span>

        <select
          aria-label={`${ariaPrefix} type`}
          value={row.type}
          onChange={(e) => {
            // Changing the type clears the chosen item (different option set)
            // and any note/location.
            onChange({
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
              aria-label={`${ariaPrefix} description`}
              value={row.id}
              onChange={e =>
                onChange({
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
              value={row.id || null}
              onValueChange={val =>
                onChange({
                  id: val ?? "",
                })}
              onInputValueChange={val => onInputValueChange(val)}
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
              <TaskResourceComboboxContent
                optionsMap={optionsMap}
                onAddNew={row.type === "resource" ? onAddResource : undefined}
              />
            </Combobox>
          )}
      </div>

      {row.type !== "" && (
        <>
          <input
            aria-label={`${ariaPrefix} notes`}
            value={row.notes}
            onChange={e =>
              onChange({
                notes: e.target.value,
              })}
            placeholder="Notes (optional)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          <input
            aria-label={`${ariaPrefix} location`}
            value={row.location}
            onChange={e =>
              onChange({
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
              aria-label={`${ariaPrefix} prepend text`}
              value={row.prependText}
              onChange={e =>
                onChange({
                  prependText: e.target.value,
                })}
              placeholder="Prepend text (e.g. Review)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
            <input
              aria-label={`${ariaPrefix} append text`}
              value={row.appendText}
              onChange={e =>
                onChange({
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
    </li>
  );
}
