import type { DailyCompletion, DailyStatus } from "./Daily";
import type { Resource } from "./Resource";
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
  taskTypeId?: string | null;
  taskType?: { id: string;
    name: string;
    tags: string[]; } | null;
  resources?: Resource[];
  todos?: TaskTodo[];
  daily?: TaskLinkedDaily | null;
}
