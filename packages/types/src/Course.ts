import type { CostData } from "./CostData";
import type { Daily } from "./Daily";
import type { MinimalTopic } from "./MinimalTopic";
import type { Module } from "./Module";
import type { ModuleGroup } from "./ModuleGroup";
import type { Topic } from "./Topic";

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
  modulesAreExhaustive?: boolean;
  topics?: MinimalTopic | Topic[] | undefined;
  provider?: {
    name: string;
    id: string;
  };
  moduleGroups?: ModuleGroup[];
  modules?: Module[];
  dailies?: Daily[];
}
