import type { CostData } from "@emstack/types/src";
import { CourseFromServer } from "@emstack/types/src";

export function processCost(course: CourseFromServer): CostData {
  let costData: CostData = {
    cost: "0",
    isCostFromPlatform: false,
  };
  if (course) {
    if (course.isCostFromPlatform === true && course.courseProvider) {
      costData = {
        cost: course.courseProvider.cost ?? "0",
        isCostFromPlatform: course.isCostFromPlatform,
        splitBy: course.courseProvider.courses
          ? course.courseProvider.courses.length
          : 1,
      };
    }
    else {
      costData = {
        cost: course.cost ?? "0",
        isCostFromPlatform: course.isCostFromPlatform,
      };
    }
  }
  return costData;
}
