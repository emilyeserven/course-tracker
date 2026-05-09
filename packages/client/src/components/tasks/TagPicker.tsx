import type { TagGroup } from "@emstack/types/src";

import { useState } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/combobox";

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

  return (
    <Combobox
      multiple
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
            <ComboboxChip
              key={id}
              value={id}
            >
              {tag?.name ?? id}
            </ComboboxChip>
          );
        })}
        <ComboboxChipsInput placeholder={value.length === 0 ? placeholder : ""} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No tags found.</ComboboxEmpty>
        <ComboboxList>
          {tagGroups.map(group => (
            <ComboboxGroup key={group.id}>
              <ComboboxLabel>{group.name}</ComboboxLabel>
              {(group.tags ?? []).map(tag => (
                <ComboboxItem
                  key={tag.id}
                  value={tag.id}
                >
                  {tag.name}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
