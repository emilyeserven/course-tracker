import assert from "node:assert";
import { afterEach, test } from "node:test";

import { getBookmarkProgress } from "../services/bookmarks.ts";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

// Stub the single GET /api/bookmarks the service issues with a canned list.
function stubBookmarks(all: unknown[]): { calls: number } {
  const state = {
    calls: 0,
  };
  globalThis.fetch = (async () => {
    state.calls += 1;
    return {
      ok: true,
      status: 200,
      json: async () => all,
    } as Response;
  }) as typeof fetch;
  return state;
}

test("getBookmarkProgress maps requested ids and drops bookmarks without progress", async () => {
  stubBookmarks([
    {
      id: "a",
      progressValues: [{
        current: 45,
        total: 320,
      }],
    },
    // Requested but has no progress — omitted from the map.
    {
      id: "b",
      progressValues: [],
    },
    // Has progress but was not requested — ignored.
    {
      id: "c",
      progressValues: [{
        current: 1,
        total: 2,
      }],
    },
  ]);

  const map = await getBookmarkProgress(["a", "b"]);

  assert.deepStrictEqual(map.get("a"), {
    current: 45,
    total: 320,
  });
  assert.strictEqual(map.has("b"), false);
  assert.strictEqual(map.has("c"), false);
  assert.strictEqual(map.size, 1);
});

test("getBookmarkProgress returns an empty map without fetching for no ids", async () => {
  const state = stubBookmarks([]);
  const map = await getBookmarkProgress([]);
  assert.strictEqual(map.size, 0);
  assert.strictEqual(state.calls, 0);
});

test("getBookmarkProgress degrades to an empty map when Simple Bookmarks is unreachable", async () => {
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;

  const map = await getBookmarkProgress(["a"]);
  assert.strictEqual(map.size, 0);
});
