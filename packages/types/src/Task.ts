import type { Tag } from "./Tag";
import type { TaskBookmark } from "./TaskBookmark";
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
  // Associations to Simple Bookmarks bookmarks (coexists with resourceLinks
  // during the incremental migration away from local Resources).
  bookmarks?: TaskBookmark[];
  resources?: TaskResource[];
  todos?: TaskTodo[];
}
