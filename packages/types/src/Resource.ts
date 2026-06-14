import type { CostData } from "./CostData";
import type { EntityStatus } from "./EntityStatus";
import type { MinimalTopic } from "./MinimalTopic";
import type { Module } from "./Module";
import type { ModuleGroup } from "./ModuleGroup";
import type { Tag } from "./Tag";
import type { ResourceLevelAttributes } from "./TaskResource";

export type ResourceStatus = EntityStatus;

export interface Resource extends ResourceLevelAttributes {
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
  topics?: MinimalTopic[];
  provider?: {
    name: string;
    id: string;
  };
  /** When true, the provider is auto-created from and kept in sync with this resource. */
  providerIsSelf?: boolean;
  moduleGroups?: ModuleGroup[];
  modules?: Module[];
  tags?: Tag[];
}
