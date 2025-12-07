import type { CostData } from "@/CostData.ts";

export type CourseStatus = "active" | "inactive" | "complete";

interface Topic {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  dateExpires?: string | null;
  cost: CostData;
  progressCurrent: number;
  progressTotal: number;
  status: CourseStatus;
  topics?: Topic[] | undefined;
  provider?: string;
}
