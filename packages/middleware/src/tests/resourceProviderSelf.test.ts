import assert from "node:assert";
import { test } from "node:test";

import {
  resolveCourseProviderId,
  selfProviderError,
} from "../routes/api/resources/resourceProviderSelf.ts";

test("selfProviderError requires a url when the resource is its own provider", () => {
  assert.strictEqual(
    selfProviderError({
      name: "Book",
      providerIsSelf: true,
      url: null,
    }),
    "A resource URL is required to use it as its own provider.",
  );
  assert.strictEqual(
    selfProviderError({
      name: "Book",
      providerIsSelf: true,
      url: "",
    }),
    "A resource URL is required to use it as its own provider.",
  );
});

test("selfProviderError passes when self-provider has a url, or is not self", () => {
  assert.strictEqual(
    selfProviderError({
      name: "Book",
      providerIsSelf: true,
      url: "https://example.com",
    }),
    null,
  );
  assert.strictEqual(
    selfProviderError({
      name: "Book",
      providerIsSelf: false,
      url: null,
    }),
    null,
  );
});

test("resolveCourseProviderId points a self-provider at the resource's own id", () => {
  assert.strictEqual(
    resolveCourseProviderId({
      name: "Book",
      providerIsSelf: true,
      url: "https://example.com",
      courseProviderId: "ignored-when-self",
    }, "r1"),
    "r1",
  );
});

test("resolveCourseProviderId uses the selected provider (or null) when not self", () => {
  assert.strictEqual(
    resolveCourseProviderId({
      name: "Book",
      providerIsSelf: false,
      courseProviderId: "p9",
    }, "r1"),
    "p9",
  );
  assert.strictEqual(
    resolveCourseProviderId({
      name: "Book",
    }, "r1"),
    null,
  );
});
