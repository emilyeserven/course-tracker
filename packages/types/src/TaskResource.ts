// A per-task resource entry. Optionally linked to a top-level Resource
// (with optional moduleGroup or module sub-target). The freeform fields
// (name, url, usedYet) are kept alongside for additional task-local
// metadata. Ease/time/interactivity/tags now live on Resource, ModuleGroup,
// and Module — when this row is linked, the linked entity supplies them.
export type TaskResourceLevel = "low" | "medium" | "high";

export interface TaskResource {
  id: string;
  taskId: string;
  name: string;
  url?: string | null;
  usedYet: boolean;
  position?: number | null;
  // Optional link to a top-level Resource (= future Course rename).
  // Both null = whole-resource link; all three null = no link.
  resourceId?: string | null;
  resource?: {
    id: string;
    name: string;
    easeOfStarting?: TaskResourceLevel | null;
    timeNeeded?: TaskResourceLevel | null;
    interactivity?: TaskResourceLevel | null;
  } | null;
  moduleGroupId?: string | null;
  moduleGroup?: {
    id: string;
    name: string;
    easeOfStarting?: TaskResourceLevel | null;
    timeNeeded?: TaskResourceLevel | null;
    interactivity?: TaskResourceLevel | null;
  } | null;
  moduleId?: string | null;
  module?: {
    id: string;
    name: string;
    easeOfStarting?: TaskResourceLevel | null;
    timeNeeded?: TaskResourceLevel | null;
    interactivity?: TaskResourceLevel | null;
  } | null;
}
