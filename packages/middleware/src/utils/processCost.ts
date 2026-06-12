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

export function processCost(resource: CostSource): CostData {
  let costData: CostData = {
    cost: null,
    isCostFromPlatform: false,
  };
  if (resource) {
    if (resource.courseProvider?.isCourseFeesShared === true) {
      costData = {
        cost: resource.courseProvider.cost ?? null,
        isCostFromPlatform: true,
        splitBy: resource.courseProvider.resources
          ? resource.courseProvider.resources.length
          : 1,
      };
    }
    else {
      costData = {
        cost: resource.cost ?? null,
        isCostFromPlatform: false,
      };
    }
  }
  return costData;
}
