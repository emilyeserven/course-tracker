import type {
  ResourceInResources,
  Tag,
  TaskResource,
  TaskResourceLink,
} from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  providerConnectionCount,
  resourceConnectionCount,
  routineConnectionCount,
  taskConnectionCount,
} from "./connectionCounts.ts";

// Minimal valid resource shell for the resource-count tests.
const baseResource: ResourceInResources = {
  id: "r",
  name: "R",
  url: "",
  dateExpires: "",
  cost: {
    splitBy: 1,
  } as ResourceInResources["cost"],
  progressCurrent: 0,
  progressTotal: 0,
  status: "active",
};

describe("connection count formulas", () => {
  test("missing optional counts are treated as zero", () => {
    expect(resourceConnectionCount(baseResource)).toBe(0);
    expect(
      providerConnectionCount({
        id: "p",
        name: "P",
        url: "",
      }),
    ).toBe(0);
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

  test("provider uses resourceCount", () => {
    expect(
      providerConnectionCount({
        id: "p",
        name: "P",
        url: "",
        resourceCount: 5,
      }),
    ).toBe(5);
  });

  test("routine counts its connections", () => {
    expect(
      routineConnectionCount({
        id: "r",
        name: "R",
        connections: [
          {
            type: "resource",
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

  test("task sums tags and both kinds of resource link", () => {
    expect(
      taskConnectionCount({
        id: "k",
        name: "K",
        tags: [{}, {}] as Tag[],
        resourceLinks: [{}] as TaskResourceLink[],
        resources: [{}, {}, {}] as TaskResource[],
      }),
    ).toBe(2 + 1 + 3);
  });
});
