import type { Tag } from "./Tag";

// TODO(tag-reform-followup): retire TaskResource entirely once tasks
// reference top-level Resources via the tasksToResources junction.
// This was the original ad-hoc per-task resource concept; the new
// Resource (= renamed Course) entity supersedes it.
export type TaskResourceLevel = "low" | "medium" | "high";

export interface TaskResource {
  id: string;
  taskId: string;
  name: string;
  url?: string | null;
  easeOfStarting?: TaskResourceLevel | null;
  timeNeeded?: TaskResourceLevel | null;
  interactivity?: TaskResourceLevel | null;
  usedYet: boolean;
  position?: number | null;
  tags: Tag[];
}
