import type { CostData } from "@emstack/types";

/**
 * The fields cost computation actually reads. Any resource row queried with
 * its courseProvider (and the provider's resources, for fee splitting) is
 * assignable here.
 */
export interface CostSource {
  cost?: string | null;
  courseProvider?: {
    cost?: string | null;
    isCourseFeesShared?: boolean | null;
    resources?: unknown[] | null;
  } | null;
}

export function processCost(course: CostSource): CostData {
  let costData: CostData = {
    cost: null,
    isCostFromPlatform: false,
  };
  if (course) {
    if (course.courseProvider?.isCourseFeesShared === true) {
      costData = {
        cost: course.courseProvider.cost ?? null,
        isCostFromPlatform: true,
        splitBy: course.courseProvider.resources
          ? course.courseProvider.resources.length
          : 1,
      };
    }
    else {
      costData = {
        cost: course.cost ?? null,
        isCostFromPlatform: false,
      };
    }
  }
  return costData;
}
