// A task's (or topic's) link to a Resource, optionally narrowed to a module
// group or a single module within that Resource. At most one of
// moduleGroupId / moduleId is set; both null = the link targets the whole
// Resource.
export interface TaskResourceLink {
  resourceId: string;
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
  position?: number | null;
}
