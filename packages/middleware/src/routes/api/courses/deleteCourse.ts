import { courses, topicsToCourses } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a course by ID",
  table: courses,
  idColumn: courses.id,
  junctions: [
    {
      table: topicsToCourses,
      foreignKey: topicsToCourses.courseId,
    },
  ],
});
