import type { ResourceFromServer } from "./ResourceFromServer";

export type RecurPeriodUnit = "days" | "months" | "years";

// TODO(course-providers-rename-followup): the entity is still named
// CourseProvider per the user's design. Provider attribute names
// (isCourseFeesShared, etc.) stay until that followup.
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
  resources?: Partial<ResourceFromServer>[] | null;
  resourceCount?: number | null;
  activeCount?: number | null;
  inactiveCount?: number | null;
  completeCount?: number | null;
  pausedCount?: number | null;
}
