import { Domain } from "@/Domain";
import { TopicsFromServer } from "@/TopicsFromServer";

export interface TopicsToDomains {
  topicId: string;
  domainId: string;
  topic?: Partial<TopicsFromServer>;
  domain?: Partial<Domain>;
}
