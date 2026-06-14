import type { CourseRow, ProviderRow } from "./-amortizationRows";
import type { CourseProvider, ResourceInResources } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  buildCourseRows,
  buildProviderRows,
  compareCourseRows,
  compareProviderRows,
} from "./-amortizationRows";

// Minimal course shell — buildCourseRows only reads cost, progress and provider.
function course(
  overrides: Partial<ResourceInResources> & { id: string },
): ResourceInResources {
  return {
    name: overrides.id,
    cost: {
      cost: "0",
      splitBy: 1,
    },
    progressCurrent: 0,
    progressTotal: 0,
    ...overrides,
  } as ResourceInResources;
}

describe("buildCourseRows", () => {
  test("derives effective cost, percent-driven cost-per-unit and started flag", () => {
    const [row] = buildCourseRows([
      course({
        id: "c1",
        cost: {
          cost: "100",
          splitBy: 2,
          isCostFromPlatform: false,
        },
        progressCurrent: 5,
        progressTotal: 10,
      }),
    ]);

    expect(row.effectiveCost).toBe(50); // 100 split two ways
    expect(row.costPerUnit).toBe(2); // 100 / 50% complete
    expect(row.isUnstarted).toBe(false);
  });

  test("an unstarted course has a null cost-per-unit", () => {
    const [row] = buildCourseRows([
      course({
        id: "c2",
        cost: {
          cost: "100",
          splitBy: 1,
          isCostFromPlatform: false,
        },
        progressCurrent: 0,
        progressTotal: 10,
      }),
    ]);

    expect(row.isUnstarted).toBe(true);
    expect(row.costPerUnit).toBeNull();
  });

  test("returns [] for undefined input", () => {
    expect(buildCourseRows(undefined)).toEqual([]);
  });
});

describe("buildProviderRows", () => {
  const courses = [
    course({
      id: "a",
      progressCurrent: 5,
      progressTotal: 10,
      provider: {
        id: "p1",
      },
    } as Partial<ResourceInResources> & { id: string }),
    course({
      id: "b",
      progressCurrent: 5,
      progressTotal: 10,
      provider: {
        id: "p1",
      },
    } as Partial<ResourceInResources> & { id: string }),
  ];

  test("aggregates only shared-fee providers and computes cost-per-unit", () => {
    const providers = [
      {
        id: "p1",
        name: "Shared",
        cost: "200",
        isCourseFeesShared: true,
      },
      {
        id: "p2",
        name: "Solo",
        cost: "200",
        isCourseFeesShared: false,
      },
    ] as CourseProvider[];

    const rows = buildProviderRows(providers, courses);

    expect(rows).toHaveLength(1);
    expect(rows[0].provider.id).toBe("p1");
    expect(rows[0].courseCount).toBe(2);
    expect(rows[0].completedUnits).toBe(10);
    expect(rows[0].totalUnits).toBe(20);
    expect(rows[0].costPerUnit).toBe(100); // (10/20) * 200
  });

  test("returns [] when either side is missing", () => {
    expect(buildProviderRows(undefined, courses)).toEqual([]);
    expect(buildProviderRows([], undefined)).toEqual([]);
  });
});

describe("comparators", () => {
  const row = (name: string, costPerUnit: number | null): CourseRow =>
    ({
      resource: {
        name,
      },
      costPerUnit,
    }) as CourseRow;

  test("descending cost-per-unit sorts unstarted (null) rows highest", () => {
    const sorted = [row("Started", 2), row("Unstarted", null)]
      .slice()
      .sort((a, b) => compareCourseRows(a, b, "costPerUnit", "desc"));
    expect(sorted.map(r => r.resource.name)).toEqual([
      "Unstarted",
      "Started",
    ]);
  });

  test("ties break alphabetically by name", () => {
    const sorted = [row("Beta", 5), row("Alpha", 5)]
      .slice()
      .sort((a, b) => compareCourseRows(a, b, "costPerUnit", "desc"));
    expect(sorted.map(r => r.resource.name)).toEqual(["Alpha", "Beta"]);
  });

  test("provider comparator reads the provider name", () => {
    const pRow = (name: string, costPerUnit: number | null): ProviderRow =>
      ({
        provider: {
          name,
        },
        costPerUnit,
      }) as ProviderRow;
    const sorted = [pRow("Zeta", 1), pRow("Alpha", 1)]
      .slice()
      .sort((a, b) => compareProviderRows(a, b, "name", "asc"));
    expect(sorted.map(r => r.provider.name)).toEqual(["Alpha", "Zeta"]);
  });
});
