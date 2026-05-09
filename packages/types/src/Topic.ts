import type { Course } from "./Course";
import type { Tag } from "./Tag";
import type { TaskResourceLink } from "./TaskResourceLink";

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
  // Reuses the TaskResourceLink shape (the link concept is the same:
  // course + optional moduleGroup or module sub-target).
  resourceLinks?: TaskResourceLink[];
}
