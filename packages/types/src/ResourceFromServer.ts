import type { CourseProvider } from "./CourseProvider";
import type { ResourceStatus } from "./Resource";

export interface ResourceFromServer {
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
  status?: ResourceStatus | null;
  courseProviderId?: string | null;
  courseProvider?: Partial<CourseProvider> | null;
}
