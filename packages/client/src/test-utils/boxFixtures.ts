import type {
  CourseProvider,
  Domain,
  ResourceInResources,
  Routine,
  RoutineTodayAction,
  Task,
  TopicForTopicsPage,
} from "@emstack/types";

/**
 * Mock-data builders for the `components/contentBoxComponents/*` stories. Each `make*` takes a
 * partial override and fills in sensible defaults, so a story only specifies the
 * fields it cares about. Mirrors the pattern in `radarFixtures.ts`.
 */

export function makeResource(
  overrides: Partial<ResourceInResources> = {},
): ResourceInResources {
  return {
    id: "resource-1",
    name: "Intro to TypeScript",
    description: "A practical, project-based introduction to TypeScript.",
    url: "https://example.com/course",
    dateExpires: "2026-12-31",
    cost: {
      cost: "49.99",
      isCostFromPlatform: false,
      splitBy: 1,
    },
    progressCurrent: 3,
    progressTotal: 10,
    status: "active",
    topics: [
      {
        id: "topic-1",
        name: "TypeScript",
      },
      {
        id: "topic-2",
        name: "Tooling",
      },
    ],
    provider: {
      id: "provider-1",
      name: "Acme Learning",
    },
    ...overrides,
  };
}

export function makeResources(count = 3): ResourceInResources[] {
  return Array.from(
    {
      length: count,
    },
    (_, i) =>
      makeResource({
        id: `resource-${i + 1}`,
        name: `Course ${i + 1}`,
        progressCurrent: i,
        progressTotal: count,
      }),
  );
}

export function makeDomain(overrides: Partial<Domain> = {}): Domain {
  return {
    id: "domain-1",
    title: "Frontend Engineering",
    description: "Everything related to building user interfaces.",
    topicCount: 5,
    ...overrides,
  };
}

export function makeProvider(
  overrides: Partial<CourseProvider> = {},
): CourseProvider {
  return {
    id: "provider-1",
    name: "Acme Learning",
    description: "An online learning platform.",
    url: "https://example.com",
    cost: "19.99",
    isCourseFeesShared: true,
    resourceCount: 4,
    ...overrides,
  };
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    name: "Finish the tutorial project",
    description: "Build the sample app end to end.",
    topic: {
      id: "topic-1",
      name: "TypeScript",
    },
    resources: [
      {
        id: "task-resource-1",
        taskId: "task-1",
        name: "Starter repo",
        usedYet: true,
      },
      {
        id: "task-resource-2",
        taskId: "task-1",
        name: "Reference docs",
        usedYet: false,
      },
    ],
    ...overrides,
  };
}

export function makeRoutine(
  overrides: Partial<
    Routine & { todayAction?: RoutineTodayAction | null }
  > = {},
): Routine & { todayAction?: RoutineTodayAction | null } {
  return {
    id: "routine-1",
    name: "Daily reading",
    description: "Read for 20 minutes every day.",
    status: "active",
    mode: "daily",
    connections: [
      {
        type: "task",
        id: "task-1",
        name: "Read a chapter",
      },
    ],
    // A task on a few weekdays: keeps daily mode free of the "no task" warning
    // and gives weekly mode a populated day strip.
    weekly: {
      1: {
        type: "task",
        id: "task-1",
      },
      3: {
        type: "task",
        id: "task-1",
      },
      5: {
        type: "task",
        id: "task-1",
      },
    },
    // Fixed dates keep the fixture deterministic; stories assert on labels, not
    // the computed chain/total numbers (which depend on the current date).
    completions: [
      {
        date: "2026-06-10",
        status: "goal",
      },
      {
        date: "2026-06-11",
        status: "goal",
      },
      {
        date: "2026-06-12",
        status: "touched",
      },
    ],
    ...overrides,
  };
}

export function makeTopicRow(
  overrides: Partial<TopicForTopicsPage> = {},
): TopicForTopicsPage {
  return {
    id: "topic-1",
    name: "TypeScript",
    description: "Static typing for JavaScript.",
    resourceCount: 4,
    taskCount: 2,
    dailyCount: 1,
    domains: [
      {
        id: "domain-1",
        title: "Frontend",
      },
      {
        id: "domain-2",
        title: "Tooling",
      },
    ],
    ...overrides,
  };
}

export function makeTopicRows(count = 3): TopicForTopicsPage[] {
  return Array.from(
    {
      length: count,
    },
    (_, i) =>
      makeTopicRow({
        id: `topic-${i + 1}`,
        name: `Topic ${i + 1}`,
        resourceCount: i,
        taskCount: i,
        dailyCount: i,
      }),
  );
}
