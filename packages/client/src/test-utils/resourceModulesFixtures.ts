import type {
  Interaction,
  Module,
  ModuleGroup,
  Resource,
  Tag,
  TagGroup,
} from "@emstack/types";

import { seededQueryClient } from "./seededQueryClient";

import { queryKeys } from "@/utils/queryKeys";

/**
 * Mock-data builders for the resource-detail module / interaction admin stories
 * (`components/resources/*`). Each `make*` takes a partial override and fills in
 * sensible defaults so a story only specifies the fields it cares about. Mirrors
 * the pattern in `boxFixtures.ts`. Defaults share `resourceId: "resource-1"` so
 * they line up with the `resourceId` the stories seed their query cache against.
 */

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: "tag-1",
    groupId: "tag-group-1",
    name: "fundamentals",
    color: null,
    position: 0,
    ...overrides,
  };
}

function makeTagGroup(overrides: Partial<TagGroup> = {}): TagGroup {
  return {
    id: "tag-group-1",
    name: "Topics",
    description: null,
    color: null,
    position: 0,
    tags: [
      makeTag({
        id: "tag-1-a",
        name: "fundamentals",
      }),
      makeTag({
        id: "tag-1-b",
        name: "advanced",
      }),
    ],
    ...overrides,
  };
}

export function makeTagGroups(count = 2): TagGroup[] {
  return Array.from(
    {
      length: count,
    },
    (_, i) =>
      makeTagGroup({
        id: `tag-group-${i + 1}`,
        name: `Tag Group ${i + 1}`,
        tags: [
          makeTag({
            id: `tag-${i + 1}-a`,
            groupId: `tag-group-${i + 1}`,
            name: `tag-${i + 1}a`,
          }),
          makeTag({
            id: `tag-${i + 1}-b`,
            groupId: `tag-group-${i + 1}`,
            name: `tag-${i + 1}b`,
          }),
        ],
      }),
  );
}

export function makeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: "module-1",
    resourceId: "resource-1",
    moduleGroupId: null,
    name: "Getting Started",
    description: "An overview of the basics.",
    url: "https://example.com/module",
    length: "30",
    status: "unstarted",
    position: 0,
    easeOfStarting: "low",
    timeNeeded: "medium",
    interactivity: "high",
    tags: [],
    ...overrides,
  };
}

export function makeModuleGroup(
  overrides: Partial<ModuleGroup> = {},
): ModuleGroup {
  return {
    id: "module-group-1",
    resourceId: "resource-1",
    name: "Section 1: Fundamentals",
    description: "The core concepts.",
    url: null,
    position: 0,
    totalCount: null,
    completedCount: null,
    easeOfStarting: "low",
    timeNeeded: "medium",
    interactivity: "high",
    tags: [],
    ...overrides,
  };
}

export function makeModuleAdminResource(
  overrides: Partial<Resource> = {},
): Resource {
  return {
    id: "resource-1",
    name: "Intro to TypeScript",
    description: "A practical introduction.",
    url: "https://example.com/course",
    cost: {
      cost: "0",
      isCostFromPlatform: false,
      splitBy: 1,
    },
    progressCurrent: 0,
    progressTotal: 0,
    status: "active",
    modulesAreExhaustive: false,
    topics: [],
    ...overrides,
  };
}

/**
 * A QueryClient seeded with everything `useResourceModules` reads via useQuery,
 * so module-admin sections render their loaded state without a network call.
 * Shared by the module-admin section stories (header / grouping / item).
 */
export function seededModuleAdminClient(seed: {
  resourceId?: string;
  groups?: ModuleGroup[];
  modules?: Module[];
  modulesAreExhaustive?: boolean;
} = {}) {
  const resourceId = seed.resourceId ?? "resource-1";
  return seededQueryClient([
    [queryKeys.resources.moduleGroups(resourceId), seed.groups ?? []],
    [queryKeys.resources.modules(resourceId), seed.modules ?? []],
    [queryKeys.tagGroups.list(), makeTagGroups()],
    [
      queryKeys.resources.detail(resourceId),
      makeModuleAdminResource({
        id: resourceId,
        modulesAreExhaustive: seed.modulesAreExhaustive ?? false,
      }),
    ],
  ]);
}

export function makeInteraction(
  overrides: Partial<Interaction> = {},
): Interaction {
  return {
    id: "interaction-1",
    resourceId: "resource-1",
    moduleGroupId: null,
    moduleId: null,
    date: "2026-06-12",
    progress: "started",
    note: "Worked through the intro.",
    difficulty: "medium",
    understanding: "comfortable",
    ...overrides,
  };
}
