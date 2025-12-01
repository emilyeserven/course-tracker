import { CourseStatus } from "@/Course";

export interface CourseInCourses {
  id: number;
  name: string;
  description?: string | null;
  url: string;
  dateExpires: string;
  cost: {
    cost: string;
    isCostFromPlatform: boolean;
    splitBy: number;
  };
  progressCurrent: number;
  progressTotal: number;
  status: CourseStatus;
  topics?: string[];
  provider?: string;

}
