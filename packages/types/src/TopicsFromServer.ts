import { TopicsToCourses } from "@/TopicsToCourses";
import { TopicsToDomains } from "@/TopicsToDomains";

export interface TopicsFromServer {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  topicsToCourses?: TopicsToCourses[] | null;
  topicsToDomains?: TopicsToDomains[] | null;
}
