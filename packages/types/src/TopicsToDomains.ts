import type { Domain } from "./Domain";
import type { TopicsFromServer } from "./TopicsFromServer";

export interface TopicsToDomains {
  topicId: string;
  domainId: string;
  topic?: Partial<TopicsFromServer>;
  domain?: Partial<Domain>;
}
