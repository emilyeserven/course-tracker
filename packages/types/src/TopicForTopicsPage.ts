export interface TopicForTopicsPage {
  id: string;
  name: string;
  description?: string | null;
  resourceCount?: number;
  taskCount?: number;
  dailyCount?: number;
}
