export type RecurPeriodUnit = "days" | "months" | "years";

export interface CourseProvider {
  id: number;
  name: string;
  description?: string;
  url: string;
  cost?: number;
  isRecurring?: boolean;
  recurPeriodUnit?: RecurPeriodUnit;
  recurPeriod?: number;
  isCourseFeesShared?: boolean;
}
