import type { Course } from "./Course";

export interface TopicDomain {
  id: string;
  title: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  courseCount?: number;
  courses?: Course[];
  domains?: TopicDomain[];
}
