import type { RoutineReferenceItem } from "@emstack/types";

import assert from "node:assert";
import { test } from "node:test";

import { resolveActionParts } from "../utils/routineActionParts.ts";

const taskEntry: RoutineReferenceItem = {
  type: "task",
  id: "task-1",
  prependText: "Review",
  appendText: "for 10 minutes",
};

test("resolveActionParts wraps the resolved task name with affixes", () => {
  assert.deepStrictEqual(
    resolveActionParts(taskEntry, {
      task: {
        id: "task-1",
        name: "Spanish drills",
      },
    }),
    {
      prependText: "Review",
      name: "Spanish drills",
      appendText: "for 10 minutes",
    },
  );
});

test("resolveActionParts uses a freeform entry's id as the name", () => {
  const freeform: RoutineReferenceItem = {
    type: "freeform",
    id: "Stretch",
  };
  assert.deepStrictEqual(resolveActionParts(freeform, {}), {
    prependText: null,
    name: "Stretch",
    appendText: null,
  });
});

test("resolveActionParts defaults missing affixes to null", () => {
  const bare: RoutineReferenceItem = {
    type: "task",
    id: "task-2",
  };
  assert.deepStrictEqual(
    resolveActionParts(bare, {
      task: {
        id: "task-2",
        name: "Read",
      },
    }),
    {
      prependText: null,
      name: "Read",
      appendText: null,
    },
  );
});

test("resolveActionParts returns null when there is no active entry", () => {
  assert.strictEqual(
    resolveActionParts(null, {
      task: {
        id: "task-1",
        name: "Spanish drills",
      },
    }),
    null,
  );
});

test("resolveActionParts returns null when nothing resolves to a name", () => {
  // A non-freeform entry with no resolved task/resource has no base name.
  assert.strictEqual(resolveActionParts(taskEntry, {}), null);
});
