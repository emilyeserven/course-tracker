import { useState } from "react";

import { PlusIcon } from "lucide-react";

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

interface TagsInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** Suggested tags to show in the dropdown. Free-text tags are always allowed. */
  suggestions?: string[];
  placeholder?: string;
  groupByPrefix?: boolean;
}

function partitionTags(tags: string[]) {
  const groups = new Map<string, string[]>();
  const otherKey = "Other";
  for (const tag of tags) {
    const idx = tag.indexOf(":");
    const groupName = idx > 0 ? tag.slice(0, idx) : otherKey;
    const bucket = groups.get(groupName);
    if (bucket) {
      bucket.push(tag);
    }
    else {
      groups.set(groupName, [tag]);
    }
  }
  const others = groups.get(otherKey);
  if (others) {
    groups.delete(otherKey);
    groups.set(otherKey, others);
  }
  return groups;
}

function stripGroup(tag: string) {
  const idx = tag.indexOf(":");
  return idx > 0 ? tag.slice(idx + 1) : tag;
}

export function TagsInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add a tag...",
  groupByPrefix = true,
}: TagsInputProps) {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = useState("");

  const allOptionValues = Array.from(new Set([...suggestions, ...value]));

  const trimmed = inputValue.trim();
  const hasMatch = trimmed.length > 0
    && allOptionValues.some(v => v.toLowerCase() === trimmed.toLowerCase());
  const showAddRow = trimmed.length > 0 && !hasMatch;

  function commitNewTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setInputValue("");
  }

  return (
    <Combobox
      multiple
      {...(groupByPrefix
        ? {}
        : {
          items: allOptionValues,
        })}
      value={value}
      onValueChange={(next: string[]) => onChange(next)}
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
        <ComboboxChipsInput
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && trimmed.length > 0 && !hasMatch) {
              e.preventDefault();
              commitNewTag(trimmed);
            }
          }}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        {showAddRow && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              commitNewTag(trimmed);
            }}
            className="
              flex w-full items-center gap-2 border-b border-border p-2
              text-left text-sm
              hover:bg-accent hover:text-accent-foreground
            "
          >
            <PlusIcon className="size-4" />
            <span>
              Add new tag:
              {" "}
              <strong>{trimmed}</strong>
            </span>
          </button>
        )}
        <ComboboxEmpty>No tags found.</ComboboxEmpty>
        <ComboboxList>
          {groupByPrefix
            ? Array.from(partitionTags(allOptionValues).entries()).map(
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
            )
            : (val: string) => (
              <ComboboxItem
                key={val}
                value={val}
              >
                {val}
              </ComboboxItem>
            )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
