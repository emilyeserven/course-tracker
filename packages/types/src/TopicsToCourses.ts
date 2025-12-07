import { Course } from "@/Course";
import { TopicsFromServer } from "@/TopicsFromServer";

export interface TopicsToCourses {
  topicId: string;
  courseId: string;
  topic?: Partial<TopicsFromServer>;
  courses?: Partial<Course>;
}
