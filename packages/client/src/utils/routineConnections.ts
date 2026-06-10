import type { SelectOption } from "./selectOptions";
import type { RoutineConnectionType } from "@emstack/types";

import { toOptions } from "./selectOptions";

export const ROUTINE_CONNECTION_TYPES: RoutineConnectionType[] = [
  "topic",
  "task",
  "resource",
];

// EntityLink's entity kind (plural route segment) for each connection type.
const ENTITY_KIND_BY_TYPE = {
  topic: "topics",
  task: "tasks",
  resource: "resources",
} as const;

export function connectionEntityKind(type: RoutineConnectionType) {
  return ENTITY_KIND_BY_TYPE[type];
}

// MultiComboboxField encodes each connection as "<Group>:<id>" so its
// groupByPrefix renders Topic / Task / Resource group headers. Entity ids are
// uuids (no colon), so splitting on the first colon is safe.
const GROUP_LABEL_BY_TYPE: Record<RoutineConnectionType, string> = {
  topic: "Topic",
  task: "Task",
  resource: "Resource",
};
const TYPE_BY_GROUP_LABEL: Record<string, RoutineConnectionType> = {
  Topic: "topic",
  Task: "task",
  Resource: "resource",
};

export function encodeConnection(c: {
  type: RoutineConnectionType;
  id: string;
}) {
  return `${GROUP_LABEL_BY_TYPE[c.type]}:${c.id}`;
}

export function decodeConnection(value: string): {
  type: RoutineConnectionType;
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

// Combined, prefixed option list for the connections multi-select. Labels stay
// the bare entity name (the group header carries the type).
export function buildConnectionOptions(
  topics: { id: string;
    name: string; }[] | null | undefined,
  tasks: { id: string;
    name: string; }[] | null | undefined,
  resources: { id: string;
    name: string; }[] | null | undefined,
): SelectOption[] {
  return [
    ...toOptions(topics).map(o => ({
      value: `Topic:${o.value}`,
      label: o.label,
    })),
    ...toOptions(tasks).map(o => ({
      value: `Task:${o.value}`,
      label: o.label,
    })),
    ...toOptions(resources).map(o => ({
      value: `Resource:${o.value}`,
      label: o.label,
    })),
  ];
}
