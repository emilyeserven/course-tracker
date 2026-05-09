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
  // TODO(tag-reform-followup): replace this varchar[] tag list with a
  // resolved Tag[] (via the resourcesToTags junction) once the resources UI
  // is migrated to the new tag system.
  tags: string[];
}
