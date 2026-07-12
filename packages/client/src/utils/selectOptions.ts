import type { TagGroup } from "@emstack/types";

export interface SelectOption {
  value: string;
  label: string;
  // Optional explicit dropdown group. When set, a grouped combobox buckets the
  // option under this label instead of deriving one from the value prefix.
  group?: string;
  // Optional link carried from the source entity. Used to offer/autofill a
  // routine entry's location; absent for entities without a link (tasks, tags).
  url?: string;
}

// Map a list of {id, name} entities to combobox/select options. A `url`, when the
// entity carries one, rides along on the option (consumed by routine autofill).
export function toOptions(
  items: { id: string;
    name: string;
    url?: string | null; }[] | null | undefined,
): SelectOption[] {
  return (items ?? []).map(item => ({
    value: item.id,
    label: item.name,
    url: item.url ?? undefined,
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
