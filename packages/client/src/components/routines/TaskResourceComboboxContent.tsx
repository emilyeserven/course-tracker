import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

/**
 * Dropdown body (empty state + value list) for the task combobox used by the
 * weekly routine editors. Shared by WeeklyEntryEditor and WeeklyScheduleField,
 * which only differ in how `optionsMap` is sourced.
 */
export function TaskResourceComboboxContent({
  optionsMap,
}: {
  optionsMap: Map<string, string>;
}) {
  return (
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
  );
}
