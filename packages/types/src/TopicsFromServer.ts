import type { TopicsToResources } from "./TopicsToResources";

export interface TopicsFromServer {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  topicsToCourses?: TopicsToResources[] | null;
}
