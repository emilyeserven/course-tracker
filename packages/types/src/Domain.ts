export interface DomainExcludedTopic {
  id: string;
  name: string;
  reason?: string | null;
}

export interface DomainTopicCourse {
  id: string;
  name: string;
  progressCurrent?: number | null;
  progressTotal?: number | null;
  status?: string | null;
}

export interface DomainTopic {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  courses?: DomainTopicCourse[];
}

export interface Domain {
  id: string;
  title: string;
  description?: string | null;
  hasRadar?: boolean | null;
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  topicCount?: number;
  topics?: DomainTopic[];
  excludedTopics?: DomainExcludedTopic[];
}
