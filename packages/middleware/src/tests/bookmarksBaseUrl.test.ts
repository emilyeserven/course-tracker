import assert from "node:assert";
import { afterEach, test } from "node:test";

import { resolveBookmarksBaseUrl } from "../services/bookmarks.ts";

const DEFAULT_BASE_URL = "http://eserve-raspi:3000";
const realEnv = process.env.BOOKMARKS_API_URL;

afterEach(() => {
  if (realEnv === undefined) delete process.env.BOOKMARKS_API_URL;
  else process.env.BOOKMARKS_API_URL = realEnv;
});

test("resolveBookmarksBaseUrl prefers the stored override over env and default", () => {
  process.env.BOOKMARKS_API_URL = "http://from-env:3000";
  assert.strictEqual(
    resolveBookmarksBaseUrl("http://override:9000"),
    "http://override:9000",
  );
});

test("resolveBookmarksBaseUrl strips trailing slashes", () => {
  assert.strictEqual(
    resolveBookmarksBaseUrl("http://override:9000///"),
    "http://override:9000",
  );
});

test("resolveBookmarksBaseUrl falls back to env when the override is blank", () => {
  process.env.BOOKMARKS_API_URL = "http://from-env:3000/";
  assert.strictEqual(resolveBookmarksBaseUrl("   "), "http://from-env:3000");
  assert.strictEqual(resolveBookmarksBaseUrl(null), "http://from-env:3000");
  assert.strictEqual(resolveBookmarksBaseUrl(undefined), "http://from-env:3000");
});

test("resolveBookmarksBaseUrl falls back to the built-in default when nothing is set", () => {
  delete process.env.BOOKMARKS_API_URL;
  assert.strictEqual(resolveBookmarksBaseUrl(null), DEFAULT_BASE_URL);
});
