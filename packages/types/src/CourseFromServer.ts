import { CourseStatus } from "@/Course";
import { CourseProvider } from "@/CourseProvider";
import { TopicsToCourses } from "@/TopicsToCourses";

export interface CourseFromServer {
  id: string;
  name: string;
  description?: string | null;
  url: string | null;
  isCostFromPlatform: boolean;
  progressCurrent?: number | null;
  progressTotal?: number | null;
  dateExpires?: string | null;
  isExpires?: boolean | null;
  cost?: string | null;
  status?: CourseStatus | null;
  minutesLength?: number | null;
  courseProviderId?: string | null;
  courseProvider?: Partial<CourseProvider> | null;
  topicsToCourses?: TopicsToCourses[] | null;
}
