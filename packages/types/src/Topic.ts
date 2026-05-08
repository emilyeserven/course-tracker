import { Course } from "@/Course";

export interface TopicDomain {
  id: string;
  title: string;
  hasRadar?: boolean | null;
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
