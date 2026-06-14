import { describe, expect, test } from "vitest";

import { stripCodeFence } from "./stripCodeFence.ts";

describe("stripCodeFence", () => {
  test("strips a fence with a language tag", () => {
    expect(stripCodeFence("```json\n{\"a\":1}\n```")).toBe("{\"a\":1}");
  });

  test("strips a fence with no language tag", () => {
    expect(stripCodeFence("```\nhello\n```")).toBe("hello");
  });

  test("trims surrounding whitespace before matching the fence", () => {
    expect(stripCodeFence("  \n```\nhello\n```\n  ")).toBe("hello");
  });

  test("returns multi-line fenced content intact", () => {
    expect(stripCodeFence("```ts\nconst a = 1;\nconst b = 2;\n```")).toBe(
      "const a = 1;\nconst b = 2;",
    );
  });

  test("returns the trimmed input when not fenced", () => {
    expect(stripCodeFence("  plain text  ")).toBe("plain text");
  });
});
