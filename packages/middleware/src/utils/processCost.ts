import type { CostData } from "@emstack/types";
import { ResourceFromServer } from "@emstack/types";

export function processCost(course: ResourceFromServer): CostData {
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
