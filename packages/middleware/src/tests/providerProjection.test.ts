import assert from "node:assert";
import { test } from "node:test";

import { toProviderBlock } from "../utils/providerProjection.ts";

test("toProviderBlock returns the public {name, id} block when both are present", () => {
  assert.deepStrictEqual(
    toProviderBlock({
      id: "prov-1",
      name: "Frontend Masters",
    }),
    {
      name: "Frontend Masters",
      id: "prov-1",
    },
  );
});

test("toProviderBlock ignores extra source columns", () => {
  // Resource rows carry cost/isCourseFeesShared/resources we don't project.
  assert.deepStrictEqual(
    toProviderBlock({
      id: "prov-2",
      name: "Pluralsight",
      cost: "29",
      isCourseFeesShared: true,
      resources: [{}, {}],
    } as { id: string;
      name: string | null; }),
    {
      name: "Pluralsight",
      id: "prov-2",
    },
  );
});

test("toProviderBlock returns undefined when the name is missing", () => {
  assert.strictEqual(toProviderBlock({
    id: "prov-3",
    name: null,
  }), undefined);
});

test("toProviderBlock returns undefined when there is no provider", () => {
  assert.strictEqual(toProviderBlock(null), undefined);
  assert.strictEqual(toProviderBlock(undefined), undefined);
});
