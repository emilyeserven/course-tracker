import type { TagGroup, TaskTodo } from "@emstack/types";

/**
 * Mock-data factories for the `components/tasks/*` stories. Each `make*` takes a
 * partial override and fills in sensible defaults, so a story only specifies the
 * fields it cares about. Mirrors the pattern in `boxFixtures.ts` /
 * `dailiesFixtures.ts`. The `Task` shell itself comes from `boxFixtures.makeTask`.
 */

export function makeTaskTodo(overrides: Partial<TaskTodo> = {}): TaskTodo {
  return {
    id: "todo-1",
    taskId: "task-1",
    name: "Read the introduction",
    status: "incomplete",
    dueDate: null,
    note: null,
    location: null,
    url: null,
    position: 0,
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

export function makeTagGroups(count = 2): TagGroup[] {
  return Array.from(
    {
      length: count,
    },
    (_, i) =>
      makeTagGroup({
        id: `tag-group-${i + 1}`,
        name: `Group ${i + 1}`,
        tags: [
          {
            id: `tag-${i + 1}-a`,
            groupId: `tag-group-${i + 1}`,
            name: `Tag ${i + 1}A`,
          },
        ],
      }),
  );
}
