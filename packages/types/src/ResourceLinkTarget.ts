import type { TaskResourceLevel } from "./TaskResource";

// The shared shape a Resource / ModuleGroup / Module exposes when it is the
// target of a task or topic resource link. Ease/time/interactivity live on
// the linked entity. Reused by TaskResource and TaskResourceLink so the
// {id,name,ease,time,interactivity} sub-object isn't repeated per-target.
export interface ResourceLinkTarget {
  id: string;
  name: string;
  easeOfStarting?: TaskResourceLevel | null;
  timeNeeded?: TaskResourceLevel | null;
  interactivity?: TaskResourceLevel | null;
}
