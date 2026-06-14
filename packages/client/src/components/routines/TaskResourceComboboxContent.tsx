import { PlusIcon } from "lucide-react";

import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

/**
 * Dropdown body (empty state + value list) for the task/resource combobox used
 * by the weekly routine editors. Shared by WeeklyEntryEditor and
 * WeeklyScheduleField, which only differ in how `optionsMap` is sourced.
 *
 * When `onAddNew` is provided, a pinned "Add resource" row is shown above the
 * results so the user can create a resource inline. It's a plain button (not a
 * ComboboxItem) so base-ui's text filtering never hides it.
 */
export function TaskResourceComboboxContent({
  optionsMap,
  onAddNew,
}: {
  optionsMap: Map<string, string>;
  onAddNew?: () => void;
}) {
  return (
    <ComboboxContent>
      {onAddNew && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onAddNew();
          }}
          className="
            flex w-full items-center gap-2 border-b border-border p-2 text-left
            text-sm
            hover:bg-accent hover:text-accent-foreground
          "
        >
          <PlusIcon className="size-4" />
          <span>Add resource</span>
        </button>
      )}
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
  );
}
