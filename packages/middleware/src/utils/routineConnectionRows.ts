import { v4 as uuidv4 } from "uuid";

import type { RoutineConnectionType } from "@/db/schema";
import type { RoutineConnection } from "@emstack/types";

// The write-side slice of a RoutineConnection: the client sends only type + id;
// the display `name` is resolved on read (see resolveRoutineConnections).
export type RoutineConnectionInput = Pick<RoutineConnection, "type" | "id">;

// Dedupe by (type, id) and produce routine_connections rows with stable
// positions, matching the junction-build pattern used for topics/tasks links.
export function buildRoutineConnectionRows(
  connections: readonly RoutineConnectionInput[] | undefined,
  routineId: string,
) {
  if (!connections) {
    return [];
  }
  const seen = new Set<string>();
  const rows: {
    id: string;
    routineId: string;
    connectedType: RoutineConnectionType;
    connectedId: string;
    position: number;
  }[] = [];
  for (const c of connections) {
    if (!c.id) {
      continue;
    }
    const key = `${c.type}:${c.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    rows.push({
      id: uuidv4(),
      routineId,
      connectedType: c.type,
      connectedId: c.id,
      position: rows.length,
    });
  }
  return rows;
}
