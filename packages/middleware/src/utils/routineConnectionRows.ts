import { v4 as uuidv4 } from "uuid";

import type { RoutineConnectionType } from "@/db/schema";
import type { RoutineConnection } from "@emstack/types";

// The write-side slice of a RoutineConnection: for local types the client sends
// type + id (the display `name` is resolved on read); for "bookmark" it also
// sends the cached `name`/`url` (see resolveRoutineConnections).
export type RoutineConnectionInput = Pick<
  RoutineConnection,
  "type" | "id" | "name" | "url"
>;

// Dedupe by (type, id) and produce routine_connections rows with stable
// positions, matching the junction-build pattern used for topics/tasks links.
// For bookmark connections the cached title/url are persisted; for local types
// they stay null (the name is resolved from the target table on read).
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
    cachedTitle: string | null;
    cachedUrl: string | null;
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
      cachedTitle: c.type === "bookmark" ? c.name ?? null : null,
      cachedUrl: c.type === "bookmark" ? c.url ?? null : null,
      position: rows.length,
    });
  }
  return rows;
}
