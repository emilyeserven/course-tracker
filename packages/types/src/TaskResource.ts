import type { Tag } from "./Tag";

// A per-task resource entry. Optionally linked to a top-level Resource
// (with optional moduleGroup or module sub-target). The freeform fields
// (name, url, ease/time/interactivity levels, usedYet, tags) are kept
// alongside for additional task-local metadata.
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
  // Optional link to a top-level Resource (= future Course rename).
  // Both null = whole-resource link; all three null = no link.
  resourceId?: string | null;
  resource?: {
    id: string;
    name: string;
  } | null;
  moduleGroupId?: string | null;
  moduleGroup?: {
    id: string;
    name: string;
  } | null;
  moduleId?: string | null;
  module?: {
    id: string;
    name: string;
  } | null;
}
