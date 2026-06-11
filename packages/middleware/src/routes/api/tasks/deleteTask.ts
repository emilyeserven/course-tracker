import {
  taskResources,
  taskTodos,
  tasks,
  tasksToResources,
  tasksToTags,
} from "@/db/schema";
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
      table: tasksToResources,
      foreignKey: tasksToResources.taskId,
    },
    {
      table: taskResources,
      foreignKey: taskResources.taskId,
    },
    {
      table: taskTodos,
      foreignKey: taskTodos.taskId,
    },
  ],
});
