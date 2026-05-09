export type ResourceLevel = "low" | "medium" | "high";

export interface Resource {
  id: string;
  taskId: string;
  name: string;
  url?: string | null;
  easeOfStarting?: ResourceLevel | null;
  timeNeeded?: ResourceLevel | null;
  interactivity?: ResourceLevel | null;
  usedYet: boolean;
  position?: number | null;
  tags: string[];
}
