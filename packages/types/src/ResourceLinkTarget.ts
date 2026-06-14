import type { ResourceLevelAttributes } from "./TaskResource";

// The shared shape a Resource / ModuleGroup / Module exposes when it is the
// target of a task or topic resource link. Ease/time/interactivity live on
// the linked entity. Reused by TaskResource and TaskResourceLink so the
// {id,name,ease,time,interactivity} sub-object isn't repeated per-target.
export interface ResourceLinkTarget extends ResourceLevelAttributes {
  id: string;
  name: string;
}

// The optional sub-target narrowing shared by a resource link (TaskResourceLink)
// and a per-task resource entry (TaskResource): which moduleGroup or module
// within the linked Resource the row points at, plus the resolved target
// objects. At most one of moduleGroupId / moduleId is set; both null = the
// link targets the whole Resource. The owning `resourceId` and row `id` differ
// in optionality between the two consumers, so they stay on each type.
export interface ResourceLinkNarrowing {
  resource?: ResourceLinkTarget | null;
  moduleGroupId?: string | null;
  moduleGroup?: ResourceLinkTarget | null;
  moduleId?: string | null;
  module?: ResourceLinkTarget | null;
}
