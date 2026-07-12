import type { WeeklyEntry, WeeklyRowType } from "./weekly";
import type { SelectOption } from "@/utils";
import type { ReactNode } from "react";

import { SingleBookmarkPicker } from "@/components/formFields";
import { TaskResourceComboboxContent } from "@/components/routines/TaskResourceComboboxContent";
import { Combobox, ComboboxInput } from "@/components/ui/combobox";

interface ScheduleItemControlProps {
  // Prefix for aria-labels (e.g. "Monday", "Mon, Jun 15", or "Daily task").
  ariaPrefix: string;
  type: WeeklyRowType;
  id: string;
  title: string;
  url: string;
  sectionId: string;
  sectionLabel: string;
  itemOptions: SelectOption[];
  optionsMap: Map<string, string>;
  onChange: (patch: Partial<WeeklyEntry>) => void;
  onInputValueChange?: (val: string) => void;
}

// The item picker for a schedule entry — a freeform text input, a single-slot
// bookmark picker, or a task combobox, chosen by `type`. The type <select> lives
// in the caller; this is just the value control. Shared by the weekly/curated
// grid rows (ScheduleEntryRow) and the Daily-mode editor.
export function ScheduleItemControl({
  ariaPrefix,
  type,
  id,
  title,
  url,
  sectionId,
  sectionLabel,
  itemOptions,
  optionsMap,
  onChange,
  onInputValueChange,
}: ScheduleItemControlProps): ReactNode {
  if (type === "freeform") {
    return (
      <input
        aria-label={`${ariaPrefix} description`}
        value={id}
        onChange={e =>
          onChange({
            id: e.target.value,
          })}
        placeholder="Describe the activity…"
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      />
    );
  }

  if (type === "bookmark") {
    return (
      <SingleBookmarkPicker
        value={{
          bookmarkId: id,
          title,
          url,
          sectionId,
          sectionLabel,
        }}
        onChange={next =>
          onChange({
            id: next.bookmarkId,
            title: next.title,
            url: next.url,
            sectionId: next.sectionId,
            sectionLabel: next.sectionLabel,
          })}
      />
    );
  }

  return (
    <Combobox
      items={itemOptions.map(o => o.value)}
      value={id || null}
      onValueChange={val =>
        onChange({
          id: val ?? "",
        })}
      onInputValueChange={onInputValueChange}
      itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
    >
      <ComboboxInput
        placeholder={type === "task" ? "Search tasks..." : "Pick a type first"}
        showClear
        disabled={!type}
      />
      <TaskResourceComboboxContent optionsMap={optionsMap} />
    </Combobox>
  );
}
