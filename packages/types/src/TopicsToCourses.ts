import { Course } from "@/Course";
import { Topic } from "@/Topic";

export interface TopicsToCourses {
  topicId: string;
  courseId: string;
  topic?: Partial<Topic>;
  courses?: Partial<Course>;
}
