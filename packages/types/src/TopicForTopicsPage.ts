export interface TopicForTopicsPageDomain {
  id: string;
  title: string;
}

export interface TopicForTopicsPage {
  id: string;
  name: string;
  description?: string | null;
  courseCount?: number;
  taskCount?: number;
  dailyCount?: number;
  domains?: TopicForTopicsPageDomain[];
}
