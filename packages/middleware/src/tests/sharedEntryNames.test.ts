import type { RoutineReferenceItem } from "@emstack/types";

import assert from "node:assert";
import { test } from "node:test";

import { buildActionableSentence, routineEntryName } from "@emstack/types";

// Direct branch coverage for the two shared @emstack/types functions that the
// client (schedule rendering) and middleware (completion baking) must both call
// so they never drift. @emstack/types has no test runner, so they're pinned
// here (see routineActionParts.test.ts for the projection that wraps them).

const taskNames = new Map([["task-1", "Spanish drills"]]);

test("routineEntryName uses a freeform entry's id as its text", () => {
  const freeform: RoutineReferenceItem = {
    type: "freeform",
    id: "Stretch",
  };
  assert.strictEqual(routineEntryName(freeform, taskNames), "Stretch");
});

test("routineEntryName uses a bookmark entry's cached title", () => {
  const bookmark: RoutineReferenceItem = {
    type: "bookmark",
    id: "bm-1",
    title: "Pimsleur",
  };
  assert.strictEqual(routineEntryName(bookmark, taskNames), "Pimsleur");
});

test("routineEntryName falls back to the id for an untitled bookmark", () => {
  const bookmark: RoutineReferenceItem = {
    type: "bookmark",
    id: "bm-untitled",
  };
  assert.strictEqual(routineEntryName(bookmark, taskNames), "bm-untitled");
});

test("routineEntryName resolves a task entry through the name map", () => {
  const task: RoutineReferenceItem = {
    type: "task",
    id: "task-1",
  };
  assert.strictEqual(routineEntryName(task, taskNames), "Spanish drills");
});

test("routineEntryName falls back to the raw id for a deleted task", () => {
  const task: RoutineReferenceItem = {
    type: "task",
    id: "task-gone",
  };
  assert.strictEqual(routineEntryName(task, taskNames), "task-gone");
});

test("buildActionableSentence joins prepend, name, and append with spaces", () => {
  assert.strictEqual(
    buildActionableSentence({
      prependText: "Review",
      name: "Spanish flashcards",
      appendText: "for 10 minutes",
    }),
    "Review Spanish flashcards for 10 minutes",
  );
});

test("buildActionableSentence returns the bare name when affixes are absent", () => {
  assert.strictEqual(
    buildActionableSentence({
      name: "Spanish flashcards",
    }),
    "Spanish flashcards",
  );
  assert.strictEqual(
    buildActionableSentence({
      prependText: null,
      name: "Spanish flashcards",
      appendText: null,
    }),
    "Spanish flashcards",
  );
});

test("buildActionableSentence trims whitespace-only affixes away", () => {
  assert.strictEqual(
    buildActionableSentence({
      prependText: "  ",
      name: " Spanish flashcards ",
      appendText: "\t",
    }),
    "Spanish flashcards",
  );
});

test("buildActionableSentence drops a blank name and keeps real affixes", () => {
  assert.strictEqual(
    buildActionableSentence({
      prependText: "Review",
      name: "",
      appendText: "for 10 minutes",
    }),
    "Review for 10 minutes",
  );
});
