import type {
  CourseProvider,
  ResourceInResources,
  Routine,
  Task,
} from "@emstack/types";

// Per-type "total links across all relationship types" counts, computed from
// the shapes the *list* endpoints return (not the heavier detail payloads).
// Keeping the definition of "most connected" in one place makes it easy to
// tweak what counts as a connection later. Pair these with the `topConnected`
// ranker (see ./topConnected) to drive the overview tiles.

// The resources list payload (ResourceInResources) no longer carries linked
// entities of its own, so a resource contributes no connection count here.
export function resourceConnectionCount(
  _resource: ResourceInResources,
): number {
  return 0;
}

export function providerConnectionCount(provider: CourseProvider): number {
  return provider.resourceCount ?? 0;
}

export function routineConnectionCount(routine: Routine): number {
  return routine.connections?.length ?? 0;
}

// `resourceLinks` are links to real Resource entities; `resources` are legacy
// task-local resources. Both are link rows, so both count toward the total.
export function taskConnectionCount(task: Task): number {
  return (
    (task.tags?.length ?? 0)
    + (task.resourceLinks?.length ?? 0)
    + (task.resources?.length ?? 0)
  );
}
