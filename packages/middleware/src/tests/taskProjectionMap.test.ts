import assert from "node:assert";
import { test } from "node:test";

import { mapTask } from "../utils/taskProjection.ts";

// A fully-populated, minimal-but-valid row. Tests spread this and override the
// field under test so each case stays focused on one behavior (mirrors
// dailyProjection.test.ts).
const baseRow = {
  id: "task-1",
  name: "Learn Spanish",
  description: null,
  taskTypeId: null,
  taskType: null,
  tasksToTags: [],
  bookmarks: [],
  todos: [],
};

const bookmarkRow = {
  id: "tb-1",
  bookmarkId: "bm-1",
  title: "Pimsleur",
  url: null,
  sectionId: null,
  sectionLabel: null,
  position: null,
};

test("mapTask maps base fields and defaults empty collections", () => {
  assert.deepStrictEqual(mapTask(baseRow), {
    id: "task-1",
    name: "Learn Spanish",
    description: null,
    taskTypeId: null,
    taskType: null,
    tags: [],
    bookmarks: [],
    todos: [],
  });
});

test("mapTask maps the task type and defaults its tags to an empty array", () => {
  const result = mapTask({
    ...baseRow,
    taskTypeId: "tt-1",
    taskType: {
      id: "tt-1",
      name: "Language",
      tags: null,
    },
  });
  assert.deepStrictEqual(result.taskType, {
    id: "tt-1",
    name: "Language",
    tags: [],
  });
  assert.strictEqual(result.taskTypeId, "tt-1");
});

test("mapTask flattens tag junction rows into tags", () => {
  const tag = {
    id: "tag-1",
    groupId: "tg-1",
    name: "language",
  };
  const result = mapTask({
    ...baseRow,
    tasksToTags: [{
      tag,
    }],
  });
  assert.deepStrictEqual(result.tags, [tag]);
});

test("mapTask sorts bookmarks by position, treating null as 0", () => {
  const result = mapTask({
    ...baseRow,
    bookmarks: [
      {
        ...bookmarkRow,
        id: "tb-b",
        bookmarkId: "bm-b",
        position: 2,
      },
      {
        ...bookmarkRow,
        id: "tb-a",
        bookmarkId: "bm-a",
        position: null,
      },
      {
        ...bookmarkRow,
        id: "tb-m",
        bookmarkId: "bm-m",
        position: 1,
      },
    ],
  });
  assert.deepStrictEqual(
    (result.bookmarks ?? []).map(b => b.id),
    ["tb-a", "tb-m", "tb-b"],
  );
});

test("mapTask does not mutate the input bookmark order", () => {
  const bookmarks = [
    {
      ...bookmarkRow,
      id: "tb-b",
      position: 1,
    },
    {
      ...bookmarkRow,
      id: "tb-a",
      position: 0,
    },
  ];
  mapTask({
    ...baseRow,
    bookmarks,
  });
  assert.deepStrictEqual(
    bookmarks.map(b => b.id),
    ["tb-b", "tb-a"],
  );
});

test("mapTask maps todos with null fallbacks and sorted nested bookmarks", () => {
  const result = mapTask({
    ...baseRow,
    todos: [
      {
        id: "td-1",
        taskId: "task-1",
        name: "Unit 1",
        status: "incomplete",
        dueDate: null,
        note: null,
        location: null,
        url: null,
        position: 0,
        bookmarks: [
          {
            ...bookmarkRow,
            id: "tb-2",
            position: 1,
          },
          {
            ...bookmarkRow,
            id: "tb-1",
            position: 0,
          },
        ],
      },
    ],
  });
  assert.deepStrictEqual(result.todos, [
    {
      id: "td-1",
      taskId: "task-1",
      name: "Unit 1",
      status: "incomplete",
      dueDate: null,
      note: null,
      location: null,
      url: null,
      position: 0,
      bookmarks: [
        {
          ...bookmarkRow,
          id: "tb-1",
          position: 0,
        },
        {
          ...bookmarkRow,
          id: "tb-2",
          position: 1,
        },
      ],
    },
  ]);
});

test("mapTask sorts todos by position", () => {
  const todo = {
    taskId: "task-1",
    name: "Unit",
    status: "incomplete" as const,
    dueDate: null,
    note: null,
    location: null,
    url: null,
    bookmarks: [],
  };
  const result = mapTask({
    ...baseRow,
    todos: [
      {
        ...todo,
        id: "td-late",
        position: 5,
      },
      {
        ...todo,
        id: "td-early",
        position: 1,
      },
    ],
  });
  assert.deepStrictEqual(
    (result.todos ?? []).map(t => t.id),
    ["td-early", "td-late"],
  );
});
