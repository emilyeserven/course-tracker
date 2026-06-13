import type {
  Domain,
  ResourceInResources,
  Tag,
  TaskResource,
  TaskResourceLink,
} from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  domainConnectionCount,
  providerConnectionCount,
  resourceConnectionCount,
  routineConnectionCount,
  taskConnectionCount,
  topConnected,
  topicConnectionCount,
} from "./topConnected.ts";

// Minimal valid resource shell for the resource-count tests (only `topics`
// matters, but the type requires these fields).
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
  test("topic sums resource, task and daily counts", () => {
    expect(topicConnectionCount({
      id: "t",
      name: "T",
      resourceCount: 2,
      taskCount: 3,
      dailyCount: 1,
    })).toBe(6);
  });

  test("missing optional counts are treated as zero", () => {
    expect(topicConnectionCount({
      id: "t",
      name: "T",
    })).toBe(0);
    expect(resourceConnectionCount(baseResource)).toBe(0);
    expect(providerConnectionCount({
      id: "p",
      name: "P",
      url: "",
    })).toBe(0);
    expect(domainConnectionCount({
      id: "d",
      title: "D",
    })).toBe(0);
    expect(routineConnectionCount({
      id: "r",
      name: "R",
    })).toBe(0);
    expect(taskConnectionCount({
      id: "k",
      name: "K",
    })).toBe(0);
  });

  test("resource counts only its linked topics", () => {
    expect(resourceConnectionCount({
      ...baseResource,
      topics: [
        {
          id: "1",
          name: "a",
        },
        {
          id: "2",
          name: "b",
        },
      ],
    })).toBe(2);
  });

  test("provider uses resourceCount", () => {
    expect(providerConnectionCount({
      id: "p",
      name: "P",
      url: "",
      resourceCount: 5,
    })).toBe(5);
  });

  test("domain uses topicCount", () => {
    expect(domainConnectionCount({
      id: "d",
      title: "D",
      topicCount: 4,
    })).toBe(4);
  });

  test("routine counts its connections", () => {
    expect(routineConnectionCount({
      id: "r",
      name: "R",
      connections: [
        {
          type: "topic",
          id: "1",
        },
        {
          type: "task",
          id: "2",
        },
      ],
    })).toBe(2);
  });

  test("task sums topic, tags and both kinds of resource link", () => {
    expect(taskConnectionCount({
      id: "k",
      name: "K",
      topic: {
        id: "t",
        name: "T",
      },
      tags: [{}, {}] as Tag[],
      resourceLinks: [{}] as TaskResourceLink[],
      resources: [{}, {}, {}] as TaskResource[],
    })).toBe(1 + 2 + 1 + 3);
  });
});

describe("topConnected ranker", () => {
  interface Row {
    id: string;
    name: string;
    count: number;
  }
  const make = (id: string, name: string, count: number): Row => ({
    id,
    name,
    count,
  });
  const getName = (i: Row) => i.name;
  const getCount = (i: Row) => i.count;

  test("returns [] for undefined or empty input", () => {
    expect(topConnected<Row>(undefined, getName, getCount)).toEqual([]);
    expect(topConnected<Row>([], getName, getCount)).toEqual([]);
  });

  test("drops items with no connections", () => {
    const items = [make("a", "A", 0), make("b", "B", 2)];
    expect(topConnected(items, getName, getCount)).toEqual([
      {
        id: "b",
        name: "B",
        count: 2,
      },
    ]);
  });

  test("sorts by count desc, breaks ties alphabetically, caps at limit", () => {
    const items = [
      make("a", "Beta", 5),
      make("b", "Alpha", 5),
      make("c", "Gamma", 9),
      make("d", "Delta", 1),
    ];
    expect(topConnected(items, getName, getCount)).toEqual([
      {
        id: "c",
        name: "Gamma",
        count: 9,
      },
      {
        id: "b",
        name: "Alpha",
        count: 5,
      },
      {
        id: "a",
        name: "Beta",
        count: 5,
      },
    ]);
  });

  test("respects a custom limit", () => {
    const items = [make("a", "A", 3), make("b", "B", 2), make("c", "C", 1)];
    expect(topConnected(items, getName, getCount, 2)).toHaveLength(2);
  });

  test("uses the supplied name accessor (domains expose `title`)", () => {
    const domains: Domain[] = [
      {
        id: "d1",
        title: "Backend",
        topicCount: 4,
      },
      {
        id: "d2",
        title: "Frontend",
        topicCount: 7,
      },
    ];
    expect(topConnected(domains, d => d.title, domainConnectionCount)).toEqual([
      {
        id: "d2",
        name: "Frontend",
        count: 7,
      },
      {
        id: "d1",
        name: "Backend",
        count: 4,
      },
    ]);
  });
});
