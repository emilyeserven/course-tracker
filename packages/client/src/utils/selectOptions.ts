import type { TagGroup } from "@emstack/types";

export interface SelectOption {
  value: string;
  label: string;
  // Optional explicit dropdown group. When set, a grouped combobox buckets the
  // option under this label instead of deriving one from the value prefix.
  group?: string;
}

// Map a list of {id, name} entities to combobox/select options.
export function toOptions(
  items: { id: string;
    name: string; }[] | null | undefined,
): SelectOption[] {
  return (items ?? []).map(item => ({
    value: item.id,
    label: item.name,
  }));
}

// Flatten tag groups into a flat list of {value, label} tag options.
export function tagGroupsToOptions(
  tagGroups: TagGroup[] | null | undefined,
): SelectOption[] {
  return (tagGroups ?? []).flatMap(group =>
    (group.tags ?? []).map(tag => ({
      value: tag.id,
      label: tag.name,
    })));
}
