import type { DailyCompletion, DailyStatus } from "./Daily";
import type { Resource } from "./Resource";

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
  resources?: Resource[];
  daily?: TaskLinkedDaily | null;
}
