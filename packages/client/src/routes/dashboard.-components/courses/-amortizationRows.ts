import type { SortDirection } from "@/components/ui/manualSort";
import type { CourseProvider, ResourceInResources } from "@emstack/types";

import { parseCost } from "@/utils";

export type ViewMode = "courses" | "providers";

export type SortKey = "name" | "costPerUnit";

export interface CourseRow {
  resource: ResourceInResources;
  effectiveCost: number;
  progressCurrent: number;
  progressTotal: number;
  progressFraction: number;
  costPerUnit: number | null;
  isUnstarted: boolean;
}

export interface ProviderRow {
  provider: CourseProvider;
  courseCount: number;
  completedUnits: number;
  totalUnits: number;
  cost: number;
  costPerUnit: number | null;
}

export function buildCourseRows(
  courses: ResourceInResources[] | undefined,
): CourseRow[] {
  if (!courses) return [];
  return courses.map((course) => {
    const rawCost = parseCost(course.cost?.cost);
    const splitBy
      = course.cost?.splitBy && course.cost.splitBy > 0 ? course.cost.splitBy : 1;
    const effectiveCost = rawCost / splitBy;
    const progressCurrent = course.progressCurrent ?? 0;
    const progressTotal = course.progressTotal ?? 0;
    const progressFraction
      = progressTotal > 0 ? progressCurrent / progressTotal : 0;
    const percentComplete
      = progressTotal > 0
        ? Number(((progressCurrent / progressTotal) * 100).toFixed(2))
        : 0;
    const costPerUnit = percentComplete > 0 ? rawCost / percentComplete : null;
    return {
      resource: course,
      effectiveCost,
      progressCurrent,
      progressTotal,
      progressFraction,
      costPerUnit,
      isUnstarted: progressCurrent === 0,
    };
  });
}

export function buildProviderRows(
  providers: CourseProvider[] | undefined,
  courses: ResourceInResources[] | undefined,
): ProviderRow[] {
  if (!providers || !courses) return [];
  const sharedFeeProviders = providers.filter(
    p => p.isCourseFeesShared === true,
  );
  return sharedFeeProviders.map((provider) => {
    const providerCourses = courses.filter(
      c => c.provider?.id === provider.id,
    );
    const completedUnits = providerCourses.reduce(
      (sum, c) => sum + (c.progressCurrent ?? 0),
      0,
    );
    const totalUnits = providerCourses.reduce(
      (sum, c) => sum + (c.progressTotal ?? 0),
      0,
    );
    const cost = parseCost(provider.cost);
    const costPerUnit
      = totalUnits > 0 ? (completedUnits / totalUnits) * cost : null;
    return {
      provider,
      courseCount: providerCourses.length,
      completedUnits,
      totalUnits,
      cost,
      costPerUnit,
    };
  });
}

/**
 * Compare two amortization rows by name or cost-per-unit (unstarted rows, with
 * a null cost-per-unit, sort highest), honoring sort direction and falling back
 * to name order on ties. `getName` adapts this to the course vs provider shape.
 */
function compareAmortizationRows<T extends { costPerUnit: number | null }>(
  a: T,
  b: T,
  key: SortKey,
  dir: SortDirection,
  getName: (row: T) => string,
): number {
  const direction = dir === "asc" ? 1 : -1;
  let av: number | string;
  let bv: number | string;
  switch (key) {
    case "name":
      av = getName(a).toLowerCase();
      bv = getName(b).toLowerCase();
      break;
    case "costPerUnit":
    default:
      av = a.costPerUnit ?? Number.POSITIVE_INFINITY;
      bv = b.costPerUnit ?? Number.POSITIVE_INFINITY;
      break;
  }
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return getName(a).localeCompare(getName(b));
}

export function compareCourseRows(
  a: CourseRow,
  b: CourseRow,
  key: SortKey,
  dir: SortDirection,
): number {
  return compareAmortizationRows(a, b, key, dir, row => row.resource.name);
}

export function compareProviderRows(
  a: ProviderRow,
  b: ProviderRow,
  key: SortKey,
  dir: SortDirection,
): number {
  return compareAmortizationRows(a, b, key, dir, row => row.provider.name);
}
