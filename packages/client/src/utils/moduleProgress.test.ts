import type { Module, ModuleGroup } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { computeGroupProgress, computeModuleProgress } from "./moduleProgress.ts";

function mod(overrides: Partial<Module>): Module {
  return {
    id: crypto.randomUUID(),
    resourceId: "r1",
    name: "m",
    status: "unstarted",
    ...overrides,
  } as Module;
}

function group(overrides: Partial<ModuleGroup>): ModuleGroup {
  return {
    id: crypto.randomUUID(),
    resourceId: "r1",
    name: "g",
    ...overrides,
  } as ModuleGroup;
}

describe("computeModuleProgress", () => {
  test("counts enumerated modules by status", () => {
    const result = computeModuleProgress(
      [
        mod({
          status: "complete",
        }),
        mod({
          status: "in_progress",
        }),
        mod({
          status: "unstarted",
        }),
        mod({
          status: "complete",
        }),
      ],
      [],
    );
    expect(result).toEqual({
      completedCount: 2,
      totalCount: 4,
      percentComplete: 50,
    });
  });

  test("adds direct counts from groups without enumerated modules", () => {
    const result = computeModuleProgress(
      [],
      [group({
        totalCount: 10,
        completedCount: 3,
      })],
    );
    expect(result).toEqual({
      completedCount: 3,
      totalCount: 10,
      percentComplete: 30,
    });
  });

  test("ignores direct counts when a group has enumerated modules", () => {
    const g = group({
      id: "g1",
      totalCount: 99,
      completedCount: 99,
    });
    const result = computeModuleProgress(
      [
        mod({
          moduleGroupId: "g1",
          status: "complete",
        }),
        mod({
          moduleGroupId: "g1",
          status: "unstarted",
        }),
      ],
      [g],
    );
    expect(result).toEqual({
      completedCount: 1,
      totalCount: 2,
      percentComplete: 50,
    });
  });

  test("combines enumerated modules with count-only groups", () => {
    const result = computeModuleProgress(
      [mod({
        status: "complete",
      })],
      [group({
        totalCount: 3,
        completedCount: 1,
      })],
    );
    expect(result).toEqual({
      completedCount: 2,
      totalCount: 4,
      percentComplete: 50,
    });
  });

  test("rounds percent and returns 0 when there is nothing to count", () => {
    expect(computeModuleProgress([], [])).toEqual({
      completedCount: 0,
      totalCount: 0,
      percentComplete: 0,
    });
    expect(
      computeModuleProgress(
        [mod({
          status: "complete",
        }), mod({}), mod({})],
        [],
      ).percentComplete,
    ).toBe(33);
  });
});

describe("computeGroupProgress", () => {
  test("measures a group by its enumerated modules", () => {
    const result = computeGroupProgress(
      [
        mod({
          moduleGroupId: "g1",
          status: "complete",
        }),
        mod({
          moduleGroupId: "g1",
          status: "unstarted",
        }),
        mod({
          moduleGroupId: "g1",
          status: "complete",
        }),
      ],
      [group({
        id: "g1",
        name: "Enumerated",
        totalCount: 99,
        completedCount: 99,
      })],
    );
    expect(result).toEqual([
      {
        id: "g1",
        name: "Enumerated",
        moduleCount: 3,
        completedCount: 2,
        percentComplete: 67,
        isComplete: false,
      },
    ]);
  });

  test("falls back to direct counts for a count-only group", () => {
    const result = computeGroupProgress(
      [],
      [group({
        id: "g1",
        name: "Count only",
        totalCount: 4,
        completedCount: 4,
      })],
    );
    expect(result).toEqual([
      {
        id: "g1",
        name: "Count only",
        moduleCount: 4,
        completedCount: 4,
        percentComplete: 100,
        isComplete: true,
      },
    ]);
  });

  test("ungrouped modules do not affect group rows", () => {
    const result = computeGroupProgress(
      [
        mod({
          moduleGroupId: null,
          status: "complete",
        }),
        mod({
          moduleGroupId: "g1",
          status: "complete",
        }),
      ],
      [group({
        id: "g1",
        name: "Grouped",
      })],
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      moduleCount: 1,
      completedCount: 1,
      isComplete: true,
    });
  });

  test("treats an empty group (no modules, no counts) as 0% and incomplete", () => {
    const result = computeGroupProgress(
      [],
      [group({
        id: "g1",
        name: "Empty",
      })],
    );
    expect(result[0]).toMatchObject({
      moduleCount: 0,
      completedCount: 0,
      percentComplete: 0,
      isComplete: false,
    });
  });

  test("sorts by position then name", () => {
    const result = computeGroupProgress(
      [],
      [
        group({
          id: "b",
          name: "Bravo",
          position: 2,
        }),
        group({
          id: "a",
          name: "Alpha",
          position: 1,
        }),
        group({
          id: "z",
          name: "Zulu",
        }),
        group({
          id: "m",
          name: "Mike",
        }),
      ],
    );
    expect(result.map(g => g.name)).toEqual(["Alpha", "Bravo", "Mike", "Zulu"]);
  });
});
