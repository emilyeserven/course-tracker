import type { CostData } from "./CostData";
import type { ResourceStatus } from "./Resource";

export interface ResourceInResources {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  dateExpires: string;
  cost: CostData & { splitBy: number };
  progressCurrent: number;
  progressTotal: number;
  status: ResourceStatus;
  topics?: (
    {
      name: string;
      id: string;
    }
  )[];
  provider?: {
    name: string;
    id: string;
  };
}
