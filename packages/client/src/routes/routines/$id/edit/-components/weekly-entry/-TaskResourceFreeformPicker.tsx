import type { WeeklyEntry, WeeklyRowType } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";
import type { ReactNode } from "react";

import { BookmarkPicker } from "@/components/formFields";
import { TaskResourceComboboxContent } from "@/components/routines/TaskResourceComboboxContent";
import { Combobox, ComboboxInput } from "@/components/ui/combobox";

interface TaskResourceFreeformPickerProps {
  type: WeeklyRowType;
  id: string;
  // Bookmark entries only: cached title/url + optional section narrowing.
  title: string;
  url: string;
  sectionId: string;
  sectionLabel: string;
  itemOptions: SelectOption[];
  optionsMap: Map<string, string>;
  onEmit: (patch: Partial<WeeklyEntry>) => void;
  onInputValueChange: (val: string) => void;
  onRequestAddResource: () => void;
}

// The type selector + item picker row: a task/resource combobox, a bookmark
// picker, or a freeform text input depending on the chosen type. Internal to
// -WeeklyEntryEditor.
export function TaskResourceFreeformPicker({
  type,
  id,
  title,
  url,
  sectionId,
  sectionLabel,
  itemOptions,
  optionsMap,
  onEmit,
  onInputValueChange,
  onRequestAddResource,
}: TaskResourceFreeformPickerProps) {
  let itemControl: ReactNode;
  if (type === "freeform") {
    itemControl = (
      <input
        aria-label="Daily task description"
        value={id}
        onChange={e =>
          onEmit({
            id: e.target.value,
          })}
        placeholder="Describe the activity…"
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      />
    );
  }
  else if (type === "bookmark") {
    // Single-slot bookmark: reuse the multi-select picker, keeping only the
    // most-recently chosen bookmark (an entry is one item).
    itemControl = (
      <BookmarkPicker
        value={id
          ? [{
            bookmarkId: id,
            title,
            url: url || null,
            sectionId: sectionId || null,
            sectionLabel: sectionLabel || null,
          }]
          : []}
        onChange={(next) => {
          const last = next[next.length - 1];
          onEmit(
            last
              ? {
                id: last.bookmarkId,
                title: last.title,
                url: last.url ?? "",
                sectionId: last.sectionId ?? "",
                sectionLabel: last.sectionLabel ?? "",
              }
              : {
                id: "",
                title: "",
                url: "",
                sectionId: "",
                sectionLabel: "",
              },
          );
        }}
      />
    );
  }
  else {
    itemControl = (
      <Combobox
        items={itemOptions.map(o => o.value)}
        value={id || null}
        onValueChange={val =>
          onEmit({
            id: val ?? "",
          })}
        onInputValueChange={val => onInputValueChange(val)}
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
        <TaskResourceComboboxContent
          optionsMap={optionsMap}
          onAddNew={type === "resource" ? onRequestAddResource : undefined}
        />
      </Combobox>
    );
  }

  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
      <select
        aria-label="Daily task type"
        value={type}
        onChange={e =>
          // Changing the type clears the chosen item (different option set)
          // and any note/location/prepend/append/bookmark fields.
          onEmit({
            type: e.target.value as WeeklyRowType,
            id: "",
            notes: "",
            location: "",
            prependText: "",
            appendText: "",
            title: "",
            url: "",
            sectionId: "",
            sectionLabel: "",
          })}
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">— None —</option>
        <option value="task">Task</option>
        <option value="resource">Resource</option>
        <option value="bookmark">Bookmark</option>
        <option value="freeform">Freeform</option>
      </select>

      {itemControl}
    </div>
  );
}
