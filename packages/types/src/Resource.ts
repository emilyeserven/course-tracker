import type { CostData } from "./CostData";
import type { Daily } from "./Daily";
import type { MinimalTopic } from "./MinimalTopic";
import type { Module } from "./Module";
import type { ModuleGroup } from "./ModuleGroup";
import type { Tag } from "./Tag";
import type { TaskResourceLevel } from "./TaskResource";
import type { Topic } from "./Topic";

export type ResourceStatus = "active" | "inactive" | "complete" | "paused";

export interface Resource {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  dateExpires?: string | null;
  cost: CostData;
  progressCurrent: number;
  progressTotal: number;
  status: ResourceStatus;
  modulesAreExhaustive?: boolean;
  topics?: MinimalTopic | Topic[] | undefined;
  provider?: {
    name: string;
    id: string;
  };
  moduleGroups?: ModuleGroup[];
  modules?: Module[];
  dailies?: Daily[];
  easeOfStarting?: TaskResourceLevel | null;
  timeNeeded?: TaskResourceLevel | null;
  interactivity?: TaskResourceLevel | null;
  tags?: Tag[];
}
