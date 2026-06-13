import type {
  CourseProvider,
  Domain,
  ResourceInResources,
  Routine,
  Task,
  TopicForTopicsPage,
} from "@emstack/types";

// One ranked entry shown as a pill inside an overview tile. `count` drives the
// ranking; the tiles render `name` only.
export interface TopConnectedItem {
  id: string;
  name: string;
  count: number;
}

// Per-type "total links across all relationship types" counts, computed from
// the shapes the *list* endpoints return (not the heavier detail payloads).
// Keeping the definition of "most connected" in one place makes it easy to
// tweak what counts as a connection later.

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

// Rank a list by connection count and return the top `limit` entries. Items
// with no connections are dropped so a tile shows nothing rather than empty
// pills; ties break alphabetically by name for stable display.
export function topConnected<T extends { id: string }>(
  items: T[] | undefined,
  getName: (item: T) => string,
  getCount: (item: T) => number,
  limit = 3,
): TopConnectedItem[] {
  if (!items?.length) return [];

  return items
    .map(item => ({
      id: item.id,
      name: getName(item),
      count: getCount(item),
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
