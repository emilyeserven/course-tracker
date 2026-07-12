import {
  taskBookmarks,
  taskTodos,
  tasks,
  tasksToTags,
} from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a task by ID",
  table: tasks,
  idColumn: tasks.id,
  routineConnectionType: "task",
  junctions: [
    {
      table: tasksToTags,
      foreignKey: tasksToTags.taskId,
    },
    {
      table: taskBookmarks,
      foreignKey: taskBookmarks.taskId,
    },
    {
      table: taskTodos,
      foreignKey: taskTodos.taskId,
    },
  ],
});
