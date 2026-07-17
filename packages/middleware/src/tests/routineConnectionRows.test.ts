import assert from "node:assert";
import { test } from "node:test";

import type { RoutineConnectionInput } from "../utils/routineConnectionRows.ts";
import { buildRoutineConnectionRows } from "../utils/routineConnectionRows.ts";

const taskConnection: RoutineConnectionInput = {
  type: "task",
  id: "task-1",
};

const bookmarkConnection: RoutineConnectionInput = {
  type: "bookmark",
  id: "bm-1",
  name: "Pimsleur",
  url: "https://example.com/pimsleur",
  sectionId: "sec-1",
  sectionLabel: "Unit 3",
};

test("buildRoutineConnectionRows returns an empty list for undefined input", () => {
  assert.deepStrictEqual(buildRoutineConnectionRows(undefined, "r-1"), []);
});

test("buildRoutineConnectionRows persists cached fields for bookmarks only", () => {
  const rows = buildRoutineConnectionRows(
    [taskConnection, bookmarkConnection],
    "r-1",
  );

  assert.strictEqual(rows.length, 2);
  const [task, bookmark] = rows;

  // Local types resolve their display name from the target table on read, so
  // nothing is cached even if the client sent a name.
  assert.strictEqual(task.connectedType, "task");
  assert.strictEqual(task.connectedId, "task-1");
  assert.strictEqual(task.cachedTitle, null);
  assert.strictEqual(task.cachedUrl, null);
  assert.strictEqual(task.sectionId, null);
  assert.strictEqual(task.sectionLabel, null);

  assert.strictEqual(bookmark.connectedType, "bookmark");
  assert.strictEqual(bookmark.cachedTitle, "Pimsleur");
  assert.strictEqual(bookmark.cachedUrl, "https://example.com/pimsleur");
  assert.strictEqual(bookmark.sectionId, "sec-1");
  assert.strictEqual(bookmark.sectionLabel, "Unit 3");

  for (const row of rows) {
    assert.strictEqual(row.routineId, "r-1");
    assert.ok(row.id);
  }
});

test("buildRoutineConnectionRows nulls missing bookmark cache fields", () => {
  const [row] = buildRoutineConnectionRows(
    [
      {
        type: "bookmark",
        id: "bm-bare",
      },
    ],
    "r-1",
  );
  assert.strictEqual(row.cachedTitle, null);
  assert.strictEqual(row.cachedUrl, null);
  assert.strictEqual(row.sectionId, null);
  assert.strictEqual(row.sectionLabel, null);
});

test("buildRoutineConnectionRows dedupes by (type, id) keeping the first", () => {
  const rows = buildRoutineConnectionRows(
    [
      bookmarkConnection,
      {
        ...bookmarkConnection,
        name: "Duplicate",
      },
      // Same id under a different type is a distinct connection, not a dupe.
      {
        type: "task",
        id: "bm-1",
      },
    ],
    "r-1",
  );
  assert.deepStrictEqual(
    rows.map(r => `${r.connectedType}:${r.connectedId}`),
    ["bookmark:bm-1", "task:bm-1"],
  );
  assert.strictEqual(rows[0].cachedTitle, "Pimsleur");
});

test("buildRoutineConnectionRows skips entries without an id and keeps positions dense", () => {
  const rows = buildRoutineConnectionRows(
    [
      {
        type: "task",
        id: "",
      },
      taskConnection,
      bookmarkConnection,
    ],
    "r-1",
  );
  assert.deepStrictEqual(
    rows.map(r => [r.connectedId, r.position]),
    [
      ["task-1", 0],
      ["bm-1", 1],
    ],
  );
});
