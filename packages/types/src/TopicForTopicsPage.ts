export interface TopicForTopicsPageDomain {
  id: string;
  title: string;
}

export interface TopicForTopicsPage {
  id: string;
  name: string;
  description?: string | null;
  courseCount?: number;
  domains?: TopicForTopicsPageDomain[];
}
