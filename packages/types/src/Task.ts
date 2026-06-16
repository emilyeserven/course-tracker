import type { Tag } from "./Tag";
import type { TaskResource } from "./TaskResource";
import type { TaskResourceLink } from "./TaskResourceLink";
import type { TaskTodo } from "./TaskTodo";

export interface Task {
  id: string;
  name: string;
  description?: string | null;
  // Optional due date for the whole Task List ("YYYY-MM-DD"), paralleling a
  // Curated Routine's end date.
  dueDate?: string | null;
  topicId?: string | null;
  topic?: { id: string;
    name: string; } | null;
  // TODO(tag-reform-followup): drop taskTypeId/taskType once the new tag
  // system replaces Task Types.
  taskTypeId?: string | null;
  taskType?: { id: string;
    name: string;
    tags: string[]; } | null;
  tags?: Tag[];
  resourceLinks?: TaskResourceLink[];
  resources?: TaskResource[];
  todos?: TaskTodo[];
}
