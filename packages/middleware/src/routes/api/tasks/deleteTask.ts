import { resources, tasks } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a task by ID",
  table: tasks,
  idColumn: tasks.id,
  junction: {
    table: resources,
    foreignKey: resources.taskId,
  },
});
