import type { ResourceLinkNarrowing } from "./ResourceLinkTarget";

// A task's (or topic's) link to a Resource, optionally narrowed to a module
// group or a single module within that Resource. At most one of
// moduleGroupId / moduleId is set; both null = the link targets the whole
// Resource. A task can hold multiple links per Resource (different
// sub-targets), so each link has a stable per-row `id`.
export interface TaskResourceLink extends ResourceLinkNarrowing {
  id?: string;
  resourceId: string;
  position?: number | null;
}
