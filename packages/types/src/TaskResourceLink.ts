import type { ResourceLinkTarget } from "./ResourceLinkTarget";

// A task's (or topic's) link to a Resource, optionally narrowed to a module
// group or a single module within that Resource. At most one of
// moduleGroupId / moduleId is set; both null = the link targets the whole
// Resource. A task can hold multiple links per Resource (different
// sub-targets), so each link has a stable per-row `id`.
export interface TaskResourceLink {
  id?: string;
  resourceId: string;
  resource?: ResourceLinkTarget | null;
  moduleGroupId?: string | null;
  moduleGroup?: ResourceLinkTarget | null;
  moduleId?: string | null;
  module?: ResourceLinkTarget | null;
  position?: number | null;
}
