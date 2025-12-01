import { CourseProvider } from "@/CourseProvider";

export type CourseStatus = "active" | "inactive" | "complete";

export interface Course {
  id: number;
  name: string;
  description: string;
  url: string;
  isCostFromPlatform: boolean;
  progressCurrent?: number;
  progressTotal?: number;
  dateExpires?: string;
  cost?: number;
  status?: CourseStatus;
  minutesLength?: number;
  courseProviderId?: number;
  courseProvider?: CourseProvider;
}
