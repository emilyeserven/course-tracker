import type { ResourceStatus } from "./Resource";

export interface ResourceInResources {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  dateExpires: string;
  cost: {
    cost: string | null;
    isCostFromPlatform: boolean;
    splitBy: number;
  };
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
  dailies?: {
    id: string;
    name: string;
  }[];
}
