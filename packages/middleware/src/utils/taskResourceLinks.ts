import { db } from "@/db";

// The set of task ids that reference a given resource, across both link tables:
// the canonical tasksToResources junction and the task-local taskResources rows
// whose optional resourceId points at it. Used to decide whether a routine's
// task-typed day action "involves" a resource (resource Interactions tab).
export async function getTaskIdsForResource(
  resourceId: string,
): Promise<Set<string>> {
  const [junction, local] = await Promise.all([
    db.query.tasksToResources.findMany({
      where: (t, {
        eq,
      }) => eq(t.resourceId, resourceId),
      columns: {
        taskId: true,
      },
    }),
    db.query.taskResources.findMany({
      where: (t, {
        eq,
      }) => eq(t.resourceId, resourceId),
      columns: {
        taskId: true,
      },
    }),
  ]);

  const ids = new Set<string>();
  for (const row of junction) {
    ids.add(row.taskId);
  }
  for (const row of local) {
    ids.add(row.taskId);
  }
  return ids;
}
