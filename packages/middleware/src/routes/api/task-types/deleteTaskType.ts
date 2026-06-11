import { taskTypes, tasks } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a task type by ID (only if no tasks reference it)",
  table: taskTypes,
  idColumn: taskTypes.id,
  guard: {
    table: tasks,
    column: tasks.taskTypeId,
    message: count =>
      `Cannot delete task type: ${count} task${count === 1 ? "" : "s"} still reference it`,
  },
});
