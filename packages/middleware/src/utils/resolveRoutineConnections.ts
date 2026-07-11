import { db } from "@/db";
import type { RoutineConnectionType } from "@/db/schema";

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
  const resourceIds = new Set<string>();

  for (const row of rows) {
    for (const c of row.connections ?? []) {
      if (c.connectedType === "task") {
        taskIds.add(c.connectedId);
      }
      else if (c.connectedType === "resource") {
        resourceIds.add(c.connectedId);
      }
    }
  }

  const [taskRows, resourceRows] = await Promise.all([
    taskIds.size
      ? db.query.tasks.findMany({
        where: (t, {
          inArray,
        }) => inArray(t.id, [...taskIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
    resourceIds.size
      ? db.query.resources.findMany({
        where: (r, {
          inArray,
        }) => inArray(r.id, [...resourceIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
  ]);

  const nameByType: Record<
    Exclude<RoutineConnectionType, "bookmark">,
    Map<string, string>
  > = {
    task: new Map(taskRows.map(r => [r.id, r.name])),
    resource: new Map(resourceRows.map(r => [r.id, r.name])),
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
