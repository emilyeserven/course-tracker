import { courses, topicsToCourses } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a course by ID",
  table: courses,
  idColumn: courses.id,
  junction: {
    table: topicsToCourses,
    foreignKey: topicsToCourses.courseId,
  },
});
