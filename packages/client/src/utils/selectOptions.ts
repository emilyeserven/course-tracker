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

// Bucket resource-owned entities (modules / module groups) by their resource id,
// each mapped to combobox/select options. Used to offer a resource entry the
// narrowing choices for its chosen resource.
export function groupOptionsByResource(
  items: { id: string;
    name: string;
    resourceId: string;
    moduleGroupId?: string | null; }[] | null | undefined,
): Map<string, SelectOption[]> {
  const byResource = new Map<string, SelectOption[]>();
  for (const item of items ?? []) {
    const options = byResource.get(item.resourceId) ?? [];
    options.push({
      value: item.id,
      label: item.name,
      // Modules carry their parent group so a resource entry can scope its
      // module dropdown to the chosen group; module groups have none → "".
      group: item.moduleGroupId ?? "",
    });
    byResource.set(item.resourceId, options);
  }
  return byResource;
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
