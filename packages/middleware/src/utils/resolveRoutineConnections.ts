import type { RoutineConnectionType } from "@/db/schema";

import { taskNamesByIds } from "@/utils/taskNames";

import type { RoutineConnection } from "@emstack/types";

export interface RawRoutineConnection {
  connectedType: RoutineConnectionType;
  connectedId: string;
  // Bookmark connections carry their own cached label (no local row to resolve)
  // plus optional section narrowing.
  cachedTitle?: string | null;
  cachedUrl?: string | null;
  sectionId?: string | null;
  sectionLabel?: string | null;
}

// A shared RoutineConnection with its display name resolved on read (always
// present here, unlike the optional `name` on the wire/persisted shape).
export type ResolvedRoutineConnection = RoutineConnection & { name: string };

// Batch-resolve display names for the polymorphic connections across a set of
// routines, querying each target table at most once (avoids N+1). Connections
// whose target no longer exists are dropped, mirroring how dangling weekly-grid
// entries are ignored on read.
export async function resolveRoutineConnections<
  T extends { connections?: RawRoutineConnection[] | null },
>(rows: T[]): Promise<(Omit<T, "connections"> & {
  connections: ResolvedRoutineConnection[];
})[]> {
  const taskIds = new Set<string>();

  for (const row of rows) {
    for (const c of row.connections ?? []) {
      if (c.connectedType === "task") {
        taskIds.add(c.connectedId);
      }
    }
  }

  const nameByType: Record<
    Exclude<RoutineConnectionType, "bookmark">,
    Map<string, string>
  > = {
    task: await taskNamesByIds(taskIds),
  };

  return rows.map((row) => {
    const {
      connections: raw, ...rest
    } = row;
    const connections = (raw ?? [])
      .map((c): ResolvedRoutineConnection | null => {
        // Bookmark connections have no local row — render the cached label and
        // never drop them (a deleted bookmark just leaves a stale chip).
        if (c.connectedType === "bookmark") {
          return {
            type: "bookmark",
            id: c.connectedId,
            name: c.cachedTitle ?? "Bookmark",
            url: c.cachedUrl ?? null,
            sectionId: c.sectionId ?? null,
            sectionLabel: c.sectionLabel ?? null,
          };
        }
        const name = nameByType[c.connectedType].get(c.connectedId);
        return name
          ? {
            type: c.connectedType,
            id: c.connectedId,
            name,
          }
          : null;
      })
      .filter((c): c is ResolvedRoutineConnection => c !== null);
    return {
      ...rest,
      connections,
    };
  });
}
