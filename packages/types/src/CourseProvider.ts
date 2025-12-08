import { CourseFromServer } from "./CourseFromServer";

export type RecurPeriodUnit = "days" | "months" | "years";

export interface CourseProvider {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  cost?: string | null;
  isRecurring?: boolean | null;
  recurDate?: string | null;
  recurPeriodUnit?: RecurPeriodUnit | null;
  recurPeriod?: number | null;
  isCourseFeesShared?: boolean | null;
  courses?: Partial<CourseFromServer>[] | null;
  courseCount?: number | null;
}
