import type { CostData } from "@/CostData.ts";

export type CourseStatus = "active" | "inactive" | "complete";

export interface Course {
  id: string;
  name: string;
  description?: string | null;
  url?: string;
  dateExpires?: string | null;
  cost: CostData;
  progressCurrent: number;
  progressTotal: number;
  status: CourseStatus;
  topics?: string[];
  provider?: string;
}
