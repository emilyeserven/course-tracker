import type {
  CourseProvider,
  Domain,
  ResourceInResources,
  Routine,
  Task,
  TopicForTopicsPage,
} from "@emstack/types";

// Per-type "total links across all relationship types" counts, computed from
// the shapes the *list* endpoints return (not the heavier detail payloads).
// Keeping the definition of "most connected" in one place makes it easy to
// tweak what counts as a connection later. Pair these with the `topConnected`
// ranker (see ./topConnected) to drive the overview tiles.

export function topicConnectionCount(topic: TopicForTopicsPage): number {
  return (topic.resourceCount ?? 0)
    + (topic.taskCount ?? 0)
    + (topic.dailyCount ?? 0);
}

// The resources list payload (ResourceInResources) carries linked topics only —
// no tags — so a resource's connectedness is its linked-topic count.
export function resourceConnectionCount(resource: ResourceInResources): number {
  return resource.topics?.length ?? 0;
}

export function providerConnectionCount(provider: CourseProvider): number {
  return provider.resourceCount ?? 0;
}

export function domainConnectionCount(domain: Domain): number {
  return domain.topicCount ?? 0;
}

export function routineConnectionCount(routine: Routine): number {
  return routine.connections?.length ?? 0;
}

// `resourceLinks` are links to real Resource entities; `resources` are legacy
// task-local resources. Both are link rows, so both count toward the total.
export function taskConnectionCount(task: Task): number {
  return (task.topic ? 1 : 0)
    + (task.tags?.length ?? 0)
    + (task.resourceLinks?.length ?? 0)
    + (task.resources?.length ?? 0);
}
