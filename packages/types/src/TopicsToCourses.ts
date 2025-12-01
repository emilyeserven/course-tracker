import { Course } from "@/Course";
import { Topic } from "@/Topic";

export interface TopicsToCourses {
  topicId: number;
  courseId: number;
  topic?: Partial<Topic>;
  courses?: Partial<Course>;
}
