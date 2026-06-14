export const MODULE_STATUSES = [
  "unstarted",
  "in_progress",
  "complete",
] as const;

export type ModuleStatus = typeof MODULE_STATUSES[number];

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  unstarted: "Unstarted",
  in_progress: "In Progress",
  complete: "Complete",
};

export function isModuleComplete(status: ModuleStatus): boolean {
  return status === "complete";
}
