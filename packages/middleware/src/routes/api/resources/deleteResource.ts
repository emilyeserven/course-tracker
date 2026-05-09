import {
  resources,
  interactions,
  moduleGroups,
  modules,
  tasksToResources,
  topicsToResources,
} from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a course by ID",
  table: resources,
  idColumn: resources.id,
  junctions: [
    {
      table: topicsToResources,
      foreignKey: topicsToResources.resourceId,
    },
    {
      table: tasksToResources,
      foreignKey: tasksToResources.resourceId,
    },
    // Interactions reference resources + (optionally) modules / moduleGroups.
    // Delete them before the modules cascade so the moduleGroupId / moduleId
    // FKs (ON DELETE SET NULL) don't have to do extra work.
    {
      table: interactions,
      foreignKey: interactions.resourceId,
    },
    // Modules reference moduleGroups, so delete modules first (junctions run
    // in order). Both modules and moduleGroups reference resources.
    {
      table: modules,
      foreignKey: modules.resourceId,
    },
    {
      table: moduleGroups,
      foreignKey: moduleGroups.resourceId,
    },
  ],
});
