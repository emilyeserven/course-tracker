import {
  courses,
  interactions,
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
    // Interactions reference courses + (optionally) modules / moduleGroups.
    // Delete them before the modules cascade so the moduleGroupId / moduleId
    // FKs (ON DELETE SET NULL) don't have to do extra work.
    {
      table: interactions,
      foreignKey: interactions.courseId,
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
