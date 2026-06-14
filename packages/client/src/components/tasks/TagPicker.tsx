import type { TagGroup } from "@emstack/types";

import { useState } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";

interface TagPickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  tagGroups: TagGroup[];
  placeholder?: string;
}

export function TagPicker({
  value,
  onChange,
  tagGroups,
  placeholder = "Pick tags...",
}: TagPickerProps) {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = useState("");

  const tagsById = new Map<string, { id: string;
    name: string; }>();
  for (const group of tagGroups) {
    for (const tag of group.tags ?? []) {
      tagsById.set(tag.id, tag);
    }
  }

  // Base UI grouped-items shape: `items` lets the dropdown filter within each
  // group and hide empty ones (`value` is the header label, kept alongside the
  // group `id` so both survive filtering).
  const groupedItems = tagGroups.map(group => ({
    id: group.id,
    value: group.name,
    items: (group.tags ?? []).map(tag => tag.id),
  }));

  return (
    <Combobox
      multiple
      items={groupedItems}
      value={value}
      onValueChange={(next: string[]) => onChange(next)}
      inputValue={inputValue}
      onInputValueChange={(val: string) => setInputValue(val)}
      itemToStringLabel={(id: string) => tagsById.get(id)?.name ?? id}
    >
      <ComboboxChips ref={anchor}>
        {value.map((id) => {
          const tag = tagsById.get(id);
          return (
            <ComboboxChip key={id}>
              {tag?.name ?? id}
            </ComboboxChip>
          );
        })}
        <ComboboxChipsInput placeholder={value.length === 0 ? placeholder : ""} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No tags found.</ComboboxEmpty>
        <ComboboxList>
          {(group: { id: string;
            value: string;
            items: string[]; }) => (
            <ComboboxGroup
              key={group.id}
              items={group.items}
            >
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(id: string) => (
                  <ComboboxItem
                    key={id}
                    value={id}
                  >
                    {tagsById.get(id)?.name ?? id}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
