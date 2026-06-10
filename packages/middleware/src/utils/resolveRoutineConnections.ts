import { db } from "@/db";
import type { RoutineConnectionType } from "@/db/schema";

export interface RawRoutineConnection {
  connectedType: RoutineConnectionType;
  connectedId: string;
}

export interface ResolvedRoutineConnection {
  type: RoutineConnectionType;
  id: string;
  name: string;
}

// Batch-resolve display names for the polymorphic connections across a set of
// routines, querying each target table at most once (avoids N+1). Connections
// whose target no longer exists are dropped, mirroring how dangling weekly-grid
// entries are ignored on read.
export async function resolveRoutineConnections<
  T extends { connections?: RawRoutineConnection[] | null },
>(rows: T[]): Promise<(Omit<T, "connections"> & {
  connections: ResolvedRoutineConnection[];
})[]> {
  const topicIds = new Set<string>();
  const taskIds = new Set<string>();
  const resourceIds = new Set<string>();

  for (const row of rows) {
    for (const c of row.connections ?? []) {
      if (c.connectedType === "topic") {
        topicIds.add(c.connectedId);
      }
      else if (c.connectedType === "task") {
        taskIds.add(c.connectedId);
      }
      else if (c.connectedType === "resource") {
        resourceIds.add(c.connectedId);
      }
    }
  }

  const [topicRows, taskRows, resourceRows] = await Promise.all([
    topicIds.size
      ? db.query.topics.findMany({
        where: (t, {
          inArray,
        }) => inArray(t.id, [...topicIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
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

  const nameByType: Record<RoutineConnectionType, Map<string, string>> = {
    topic: new Map(topicRows.map(r => [r.id, r.name])),
    task: new Map(taskRows.map(r => [r.id, r.name])),
    resource: new Map(resourceRows.map(r => [r.id, r.name])),
  };

  return rows.map((row) => {
    const {
      connections: raw, ...rest
    } = row;
    const connections = (raw ?? [])
      .map((c): ResolvedRoutineConnection | null => {
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
