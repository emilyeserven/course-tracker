import type { SelectOption } from "./selectOptions";
import type { EntityKind } from "@/components/boxElements/EntityLink";
import type { RoutineConnectionType } from "@emstack/types";

import { toOptions } from "./selectOptions";

// Connection types with a local route/row. "bookmark" is external (no local
// route) and is handled separately by a bookmark picker, so it never flows
// through the encode/decode/EntityLink paths below.
export type LocalConnectionType = Exclude<RoutineConnectionType, "bookmark">;

// EntityLink's entity kind (plural route segment) for each local connection type.
const ENTITY_KIND_BY_TYPE: Record<LocalConnectionType, EntityKind> = {
  task: "tasks",
};

export function connectionEntityKind(type: LocalConnectionType) {
  return ENTITY_KIND_BY_TYPE[type];
}

// Each connection value is encoded as "<Group>:<id>" purely so encode/decode can
// round-trip the entity type. Entity ids are uuids (no colon), so splitting on
// the first colon is safe. Dropdown grouping is driven by each option's explicit
// `group` field (see buildConnectionOptions), not by this value prefix.
const GROUP_LABEL_BY_TYPE: Record<LocalConnectionType, string> = {
  task: "Task",
};
const TYPE_BY_GROUP_LABEL: Record<string, LocalConnectionType> = {
  Task: "task",
};

export function encodeConnection(c: { type: LocalConnectionType;
  id: string; }) {
  return `${GROUP_LABEL_BY_TYPE[c.type]}:${c.id}`;
}

export function decodeConnection(value: string): {
  type: LocalConnectionType;
  id: string;
} | null {
  const idx = value.indexOf(":");
  if (idx <= 0) {
    return null;
  }
  const type = TYPE_BY_GROUP_LABEL[value.slice(0, idx)];
  const id = value.slice(idx + 1);
  if (!type || !id) {
    return null;
  }
  return {
    type,
    id,
  };
}

// Option list for the connections multi-select. Labels stay the bare entity
// name; each option carries an explicit `group` for the dropdown header.
// Entities sort by name within a group.
export function buildConnectionOptions(
  tasks: { id: string;
    name: string; }[] | null | undefined,
): SelectOption[] {
  return toOptions(tasks).map(o => ({
    value: `Task:${o.value}`,
    label: o.label,
    group: "Tasks",
  }));
}
