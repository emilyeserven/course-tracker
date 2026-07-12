import type { Routine, Task } from "@emstack/types";

// Per-type "total links across all relationship types" counts, computed from
// the shapes the *list* endpoints return (not the heavier detail payloads).
// Keeping the definition of "most connected" in one place makes it easy to
// tweak what counts as a connection later. Pair these with the `topConnected`
// ranker (see ./topConnected) to drive the overview tiles.

export function routineConnectionCount(routine: Routine): number {
  return routine.connections?.length ?? 0;
}

export function taskConnectionCount(task: Task): number {
  return task.tags?.length ?? 0;
}
