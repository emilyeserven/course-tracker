import {
  courses,
  moduleGroups,
  modules,
  tasksToCourses,
  topicsToCourses,
} from "@/db/schema";
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
    {
      table: tasksToCourses,
      foreignKey: tasksToCourses.courseId,
    },
    // Modules reference moduleGroups, so delete modules first (junctions run
    // in order). Both modules and moduleGroups reference courses.
    {
      table: modules,
      foreignKey: modules.courseId,
    },
    {
      table: moduleGroups,
      foreignKey: moduleGroups.courseId,
    },
  ],
});
