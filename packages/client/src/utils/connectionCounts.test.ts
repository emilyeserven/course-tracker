import type { Tag } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  routineConnectionCount,
  taskConnectionCount,
} from "./connectionCounts.ts";

describe("connection count formulas", () => {
  test("missing optional counts are treated as zero", () => {
    expect(
      routineConnectionCount({
        id: "r",
        name: "R",
      }),
    ).toBe(0);
    expect(
      taskConnectionCount({
        id: "k",
        name: "K",
      }),
    ).toBe(0);
  });

  test("routine counts its connections", () => {
    expect(
      routineConnectionCount({
        id: "r",
        name: "R",
        connections: [
          {
            type: "task",
            id: "1",
          },
          {
            type: "task",
            id: "2",
          },
        ],
      }),
    ).toBe(2);
  });

  test("task counts its tags", () => {
    expect(
      taskConnectionCount({
        id: "k",
        name: "K",
        tags: [{}, {}] as Tag[],
      }),
    ).toBe(2);
  });
});
