import { describe, expect, test } from "vitest";

import { uuidv4 } from "./uuid.ts";

const UUID_V4_RE
  = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("uuidv4", () => {
  test("produces a valid v4 UUID string", () => {
    expect(uuidv4()).toMatch(UUID_V4_RE);
  });

  test("sets the version (4) and variant (8/9/a/b) nibbles", () => {
    for (let i = 0; i < 50; i++) {
      const id = uuidv4();
      expect(id[14]).toBe("4");
      expect(["8", "9", "a", "b"]).toContain(id[19]);
    }
  });

  test("generates distinct values", () => {
    const ids = new Set(Array.from({
      length: 1000,
    }, () => uuidv4()));
    expect(ids.size).toBe(1000);
  });
});
