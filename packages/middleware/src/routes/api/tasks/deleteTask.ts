import { resources, taskTodos, tasks, tasksToTags } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a task by ID",
  table: tasks,
  idColumn: tasks.id,
  junctions: [
    {
      table: tasksToTags,
      foreignKey: tasksToTags.taskId,
    },
    {
      table: resources,
      foreignKey: resources.taskId,
    },
    {
      table: taskTodos,
      foreignKey: taskTodos.taskId,
    },
  ],
});
