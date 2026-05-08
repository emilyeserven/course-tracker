import type { Course } from "./Course";
import type { TopicsFromServer } from "./TopicsFromServer";

export interface TopicsToCourses {
  topicId: string;
  courseId: string;
  topic?: Partial<TopicsFromServer>;
  course?: Partial<Course>;
}
