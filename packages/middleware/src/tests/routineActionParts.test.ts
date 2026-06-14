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

test("resolveActionParts prefers the resolved resource name over the task name", () => {
  assert.deepStrictEqual(
    resolveActionParts(taskEntry, {
      task: {
        id: "task-1",
        name: "Spanish drills",
      },
      resource: {
        id: "res-1",
        name: "Conjugation deck",
        progressCurrent: 1,
        progressTotal: 10,
      },
    }),
    {
      prependText: "Review",
      name: "Conjugation deck",
      appendText: "for 10 minutes",
    },
  );
});

test("resolveActionParts falls back to the resolved task name", () => {
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
