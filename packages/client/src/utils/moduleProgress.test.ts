import type { Module, ModuleGroup } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { computeModuleProgress } from "./moduleProgress.ts";

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
