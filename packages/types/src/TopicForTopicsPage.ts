import type { TopicDomain } from "./Topic";

// Same {id, title} domain reference as the full Topic view.
export type TopicForTopicsPageDomain = TopicDomain;

export interface TopicForTopicsPage {
  id: string;
  name: string;
  description?: string | null;
  resourceCount?: number;
  taskCount?: number;
  dailyCount?: number;
  domains?: TopicForTopicsPageDomain[];
}
