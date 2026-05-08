import { DomainExcludedTopic, DomainTopic, LearningLogEntry } from "@/LearningLog";

export interface Domain {
  id: string;
  title: string;
  description?: string | null;
  hasRadar?: boolean | null;
  topicCount?: number;
  topics?: DomainTopic[];
  excludedTopics?: DomainExcludedTopic[];
  learningLog?: LearningLogEntry[];
}
