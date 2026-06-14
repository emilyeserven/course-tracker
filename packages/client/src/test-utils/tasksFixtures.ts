import type {
  Module,
  ModuleGroup,
  TagGroup,
  TaskResource,
  TaskTodo,
} from "@emstack/types";

/**
 * Mock-data factories for the `components/tasks/*` stories. Each `make*` takes a
 * partial override and fills in sensible defaults, so a story only specifies the
 * fields it cares about. Mirrors the pattern in `boxFixtures.ts` /
 * `dailiesFixtures.ts`. The `Task` shell itself comes from `boxFixtures.makeTask`.
 */

export function makeTaskResource(
  overrides: Partial<TaskResource> = {},
): TaskResource {
  return {
    id: "task-resource-1",
    taskId: "task-1",
    name: "Reference docs",
    url: "https://example.com/docs",
    usedYet: false,
    resourceId: null,
    moduleGroupId: null,
    moduleId: null,
    ...overrides,
  };
}

export function makeTaskTodo(overrides: Partial<TaskTodo> = {}): TaskTodo {
  return {
    id: "todo-1",
    taskId: "task-1",
    name: "Read the introduction",
    isComplete: false,
    url: null,
    position: 0,
    ...overrides,
  };
}

export function makeModuleGroup(
  overrides: Partial<ModuleGroup> = {},
): ModuleGroup {
  return {
    id: "module-group-1",
    resourceId: "resource-1",
    name: "Part One",
    ...overrides,
  };
}

export function makeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: "module-1",
    resourceId: "resource-1",
    moduleGroupId: "module-group-1",
    name: "Chapter 1",
    status: "unstarted",
    ...overrides,
  };
}

export function makeTagGroup(overrides: Partial<TagGroup> = {}): TagGroup {
  return {
    id: "tag-group-1",
    name: "Difficulty",
    tags: [
      {
        id: "tag-easy",
        groupId: "tag-group-1",
        name: "Easy",
      },
      {
        id: "tag-hard",
        groupId: "tag-group-1",
        name: "Hard",
      },
    ],
    ...overrides,
  };
}
