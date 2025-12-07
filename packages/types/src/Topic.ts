import { Course } from "@/Course";

export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  courseCount?: number;
  courses: Course[];
}
