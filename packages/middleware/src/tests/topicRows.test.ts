import assert from "node:assert";
import { test } from "node:test";

import {
  buildTopicResourceLinkRows,
  buildTopicRow,
  buildTopicTagRows,
} from "../routes/api/topics/topicRows.ts";

function sequentialIds() {
  let n = 0;
  return () => `gen-${++n}`;
}

test("buildTopicRow normalizes optional fields", () => {
  assert.deepStrictEqual(
    buildTopicRow({
      name: "Topic",
    }, "t1"),
    {
      id: "t1",
      name: "Topic",
      description: null,
      reason: null,
    },
  );
});

test("buildTopicTagRows skips when undefined, dedupes and positions", () => {
  assert.strictEqual(buildTopicTagRows(undefined, "t1"), undefined);
  assert.deepStrictEqual(buildTopicTagRows(["a", "a", "b"], "t1"), [
    {
      topicId: "t1",
      tagId: "a",
      position: 0,
    },
    {
      topicId: "t1",
      tagId: "b",
      position: 1,
    },
  ]);
});

test("buildTopicResourceLinkRows dedupes by full tuple (no position column)", () => {
  assert.strictEqual(buildTopicResourceLinkRows(undefined, "t1"), undefined);
  assert.deepStrictEqual(buildTopicResourceLinkRows([], "t1"), []);

  const rows = buildTopicResourceLinkRows(
    [
      {
        resourceId: "r1",
      },
      {
        resourceId: "r1",
        moduleGroupId: null,
        moduleId: null,
      },
      {
        resourceId: "r1",
        moduleId: "m1",
      },
    ],
    "t1",
    sequentialIds(),
  );

  assert.deepStrictEqual(rows, [
    {
      id: "gen-1",
      topicId: "t1",
      resourceId: "r1",
      moduleGroupId: null,
      moduleId: null,
    },
    {
      id: "gen-2",
      topicId: "t1",
      resourceId: "r1",
      moduleGroupId: null,
      moduleId: "m1",
    },
  ]);
});
