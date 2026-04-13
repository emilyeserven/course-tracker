import type { CostData } from "@emstack/types/src";
import { CourseFromServer } from "@emstack/types/src";

export function processCost(course: CourseFromServer): CostData {
  let costData: CostData = {
    cost: null,
    isCostFromPlatform: false,
  };
  if (course) {
    if (course.courseProvider?.isCourseFeesShared === true) {
      costData = {
        cost: course.courseProvider.cost ?? null,
        isCostFromPlatform: true,
        splitBy: course.courseProvider.courses
          ? course.courseProvider.courses.length
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
