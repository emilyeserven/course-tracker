import { CourseFromServer } from "@emstack/types/src";

export function processCost(course: CourseFromServer) {
  let costData = {};
  if (course) {
    if (course.isCostFromPlatform === true && course.courseProvider) {
      costData = {
        cost: course.courseProvider.cost,
        isCostFromPlatform: course.isCostFromPlatform,
        splitBy: course.courseProvider.courses ? course.courseProvider.courses.length : 1,
      };
    }
    else {
      costData = {
        cost: course.cost,
        isCostFromPlatform: course.isCostFromPlatform,
      };
    }
  }
  return costData;
}
