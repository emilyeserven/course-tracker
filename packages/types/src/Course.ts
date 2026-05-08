import type { CostData } from "@/CostData";

import { Daily } from "@/Daily";
import { MinimalTopic } from "@/MinimalTopic";
import { Topic } from "@/Topic";

export type CourseStatus = "active" | "inactive" | "complete" | "paused";

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
  topics?: MinimalTopic | Topic[] | undefined;
  provider?: {
    name: string;
    id: string;
  };
  dailies?: Daily[];
}
