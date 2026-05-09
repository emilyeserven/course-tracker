import type { Course } from "./Course";
import type { Tag } from "./Tag";

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
  tags?: Tag[];
}
