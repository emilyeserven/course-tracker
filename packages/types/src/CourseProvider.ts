import { CourseFromServer } from "./CourseFromServer";

export type RecurPeriodUnit = "days" | "months" | "years";

export interface CourseProvider {
  id: number;
  name: string;
  description?: string | null;
  url: string;
  cost?: string | null;
  isRecurring?: boolean | null;
  recurPeriodUnit?: RecurPeriodUnit | null;
  recurPeriod?: number | null;
  isCourseFeesShared?: boolean | null;
  courses?: CourseFromServer[] | null;
}
