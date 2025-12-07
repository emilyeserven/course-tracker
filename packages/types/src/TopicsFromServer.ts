import { TopicsToCourses } from "@/TopicsToCourses";

export interface TopicsFromServer {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  topicsToCourses?: TopicsToCourses[] | null;
}
