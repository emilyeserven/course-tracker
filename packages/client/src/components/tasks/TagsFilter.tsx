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

interface TagsFilterProps {
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  placeholder?: string;
}

const OTHER_KEY = "Other";

function partitionTags(tags: string[]) {
  const groups = new Map<string, string[]>();
  for (const tag of tags) {
    const idx = tag.indexOf(":");
    const groupName = idx > 0 ? tag.slice(0, idx) : OTHER_KEY;
    const bucket = groups.get(groupName);
    if (bucket) {
      bucket.push(tag);
    }
    else {
      groups.set(groupName, [tag]);
    }
  }
  const others = groups.get(OTHER_KEY);
  if (others) {
    groups.delete(OTHER_KEY);
    groups.set(OTHER_KEY, others);
  }
  return groups;
}

function stripGroup(tag: string) {
  const idx = tag.indexOf(":");
  return idx > 0 ? tag.slice(idx + 1) : tag;
}

export function TagsFilter({
  value,
  onChange,
  options,
  placeholder = "Filter by tag...",
}: TagsFilterProps) {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = useState("");

  const allOptions = Array.from(new Set([...options, ...value])).sort();

  return (
    <Combobox
      multiple
      value={value}
      onValueChange={(next: string[]) => onChange(next)}
      inputValue={inputValue}
      onInputValueChange={(val: string) => setInputValue(val)}
      itemToStringLabel={(val: string) => val}
    >
      <ComboboxChips ref={anchor}>
        {value.map(tag => (
          <ComboboxChip
            key={tag}
            value={tag}
          >
            {tag}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder={value.length === 0 ? placeholder : ""} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No tags found.</ComboboxEmpty>
        <ComboboxList>
          {Array.from(partitionTags(allOptions).entries()).map(
            ([groupName, groupTags]) => (
              <ComboboxGroup key={groupName}>
                <ComboboxLabel>{groupName}</ComboboxLabel>
                {groupTags.map(tag => (
                  <ComboboxItem
                    key={tag}
                    value={tag}
                  >
                    {stripGroup(tag)}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ),
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
