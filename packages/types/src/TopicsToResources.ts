import type { Resource } from "./Resource";

export interface TopicsToResources {
  topicId: string;
  resourceId: string;
  topic?: { id: string;
    name: string; } | null;
  resource?: Partial<Resource> | null;
  moduleGroupId?: string | null;
  moduleId?: string | null;
}
