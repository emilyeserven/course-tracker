import type { DailyCompletion, DailyStatus } from "./Daily";
import type { Resource } from "./Resource";
import type { Tag } from "./Tag";
import type { TaskResourceLink } from "./TaskResourceLink";
import type { TaskTodo } from "./TaskTodo";

export interface TaskLinkedDaily {
  id: string;
  name: string;
  status?: DailyStatus | null;
  completions: DailyCompletion[];
}

export interface Task {
  id: string;
  name: string;
  description?: string | null;
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
  resources?: Resource[];
  todos?: TaskTodo[];
  daily?: TaskLinkedDaily | null;
}
