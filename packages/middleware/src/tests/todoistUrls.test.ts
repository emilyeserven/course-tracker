import assert from "node:assert";
import { test } from "node:test";

import { buildCloseTaskUrl } from "../services/todoistUrls.ts";

test("buildCloseTaskUrl builds the close URL for a plain id", () => {
  assert.strictEqual(
    buildCloseTaskUrl("12345"),
    "https://api.todoist.com/api/v1/tasks/12345/close",
  );
});

test("buildCloseTaskUrl url-encodes path-manipulating chars in the id", () => {
  // `/` would otherwise inject extra path segments / change the action target.
  assert.strictEqual(
    buildCloseTaskUrl("../projects/999"),
    "https://api.todoist.com/api/v1/tasks/..%2Fprojects%2F999/close",
  );
  // Query chars must not leak into the path either.
  assert.strictEqual(
    buildCloseTaskUrl("1?x=1"),
    "https://api.todoist.com/api/v1/tasks/1%3Fx%3D1/close",
  );
});
