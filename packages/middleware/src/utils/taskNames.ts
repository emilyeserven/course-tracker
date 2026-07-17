import { db } from "@/db";

// Batch-resolve task display names for a set of ids in one query (avoids N+1).
// Ids whose task no longer exists are simply absent from the map, so callers
// fall back per their own rules (e.g. routineEntryName's raw-id fallback).
export async function taskNamesByIds(
  taskIds: ReadonlySet<string>,
): Promise<Map<string, string>> {
  if (!taskIds.size) {
    return new Map();
  }
  const rows = await db.query.tasks.findMany({
    where: (t, {
      inArray,
    }) => inArray(t.id, [...taskIds]),
    columns: {
      id: true,
      name: true,
    },
  });
  return new Map(rows.map(r => [r.id, r.name]));
}
