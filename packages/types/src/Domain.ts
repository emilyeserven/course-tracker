export interface Domain {
  id: string;
  title: string;
  description?: string | null;
  hasRadar?: boolean | null;
  topicCount?: number;
  topics?: {
    id: string;
    name: string;
  }[];
}
