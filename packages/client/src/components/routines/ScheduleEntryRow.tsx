import type { WeeklyEntry, WeeklyRowType } from "./weekly";
import type { SelectOption } from "@/utils";

import { buildActionableSentence } from "@emstack/types";

import { ScheduleItemControl } from "@/components/routines/ScheduleItemControl";

interface ScheduleEntryRowProps {
  // Displayed label for the row (e.g. "Monday" or "Mon, Jun 15").
  label: string;
  // Prefix for the row's aria-labels (kept stable so tests/stories can target
  // e.g. "Monday type").
  ariaPrefix: string;
  row: WeeklyEntry;
  taskOptions: SelectOption[];
  onChange: (patch: Partial<WeeklyEntry>) => void;
  // Optional: surface the combobox's typed text (unused now that pickers filter
  // a static task list client-side).
  onInputValueChange?: (val: string) => void;
}

// The resolved item name and its actionable-sentence preview for a row, pulled
// out of the component to keep its complexity down. The preview only shows once
// there's prepend/append text.
function rowPreview(
  row: WeeklyEntry,
  optionsMap: Map<string, string>,
): { showPreview: boolean;
  preview: string; } {
  const itemName
    = row.type === "freeform"
      ? row.id
      : row.type === "bookmark"
        ? row.title || row.id
        : (optionsMap.get(row.id) ?? "");
  return {
    showPreview:
      !!itemName && (!!row.prependText.trim() || !!row.appendText.trim()),
    preview: buildActionableSentence({
      prependText: row.prependText,
      name: itemName,
      appendText: row.appendText,
    }),
  };
}

// One schedule row's editor: type select, task picker (or bookmark/freeform
// input), then optional notes / location / prepend / append with a live preview.
// Shared by WeeklyScheduleField (per weekday) and CuratedScheduleField (per date).
export function ScheduleEntryRow({
  label,
  ariaPrefix,
  row,
  taskOptions,
  onChange,
  onInputValueChange,
}: ScheduleEntryRowProps) {
  const itemOptions = row.type === "task" ? taskOptions : [];
  const optionsMap = new Map(itemOptions.map(o => [o.value, o.label]));
  const {
    showPreview, preview,
  } = rowPreview(row, optionsMap);

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
            // Changing the type clears the chosen item (different option set),
            // any bookmark narrowing, and any note/location.
            onChange({
              type: e.target.value as WeeklyRowType,
              id: "",
              notes: "",
              location: "",
              title: "",
              url: "",
              sectionId: "",
              sectionLabel: "",
            });
          }}
          className="
            flex h-9 w-full rounded-md border bg-background px-2 text-sm
          "
        >
          <option value="">— None —</option>
          <option value="task">Task</option>
          <option value="bookmark">Bookmark</option>
          <option value="freeform">Freeform</option>
        </select>

        <ScheduleItemControl
          ariaPrefix={ariaPrefix}
          type={row.type}
          id={row.id}
          title={row.title}
          url={row.url}
          sectionId={row.sectionId}
          sectionLabel={row.sectionLabel}
          itemOptions={itemOptions}
          optionsMap={optionsMap}
          onChange={onChange}
          onInputValueChange={onInputValueChange}
        />
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
