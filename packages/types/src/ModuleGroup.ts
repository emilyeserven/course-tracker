import type { Module } from "./Module";
import type { Tag } from "./Tag";
import type { TaskResourceLevel } from "./TaskResource";

export interface ModuleGroup {
  id: string;
  resourceId: string;
  name: string;
  description?: string | null;
  url?: string | null;
  position?: number | null;
  // Direct progress counts. Used when the group has no enumerated modules:
  // lets the user track "X of Y done" without listing each module.
  // Ignored when the group has enumerated modules — counts derive from
  // those modules in that case.
  totalCount?: number | null;
  completedCount?: number | null;
  modules?: Module[];
  easeOfStarting?: TaskResourceLevel | null;
  timeNeeded?: TaskResourceLevel | null;
  interactivity?: TaskResourceLevel | null;
  tags?: Tag[];
}
