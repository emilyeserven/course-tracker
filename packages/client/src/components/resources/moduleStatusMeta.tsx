import type { Module, ModuleGroup, ModuleStatus } from "@emstack/types";

import { isModuleComplete, MODULE_STATUS_LABELS } from "@emstack/types";
import { CircleCheckIcon, CircleDashedIcon, CircleDotIcon } from "lucide-react";

/**
 * Visual metadata for a module's status, mirroring the daily status meta
 * (`components/dailies/dailyStatusMeta.tsx`) so module status circles speak the
 * same colour/icon language as the routine/daily tracker. Module statuses are
 * their own three-value set, so they get their own option list rather than
 * reusing the hard-typed `DailyCompletionStatus`.
 */
export interface ModuleStatusOption {
  value: ModuleStatus;
  label: string;
  icon: React.ReactNode;
  circleClass: string;
  pillClass: string;
}

export const MODULE_STATUS_OPTIONS: ModuleStatusOption[] = [
  {
    value: "unstarted",
    label: MODULE_STATUS_LABELS.unstarted,
    icon: <CircleDashedIcon />,
    circleClass: "bg-muted text-muted-foreground border-muted-foreground/40",
    pillClass: "bg-muted text-muted-foreground border-muted-foreground/40",
  },
  {
    value: "in_progress",
    label: MODULE_STATUS_LABELS.in_progress,
    icon: <CircleDotIcon />,
    circleClass:
      "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200",
    pillClass:
      "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200",
  },
  {
    value: "complete",
    label: MODULE_STATUS_LABELS.complete,
    icon: <CircleCheckIcon />,
    circleClass:
      "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-200",
    pillClass:
      "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
];

export function getModuleStatusOption(status: ModuleStatus): ModuleStatusOption {
  return (
    MODULE_STATUS_OPTIONS.find(o => o.value === status)
    ?? MODULE_STATUS_OPTIONS[0]
  );
}

/**
 * Derive a group's overall status for the read-only status circle shown next to
 * its name. When the group has enumerated modules, the status reflects those
 * modules (all complete → complete; any progress/mix → in_progress; otherwise
 * unstarted). Otherwise it falls back to the group's direct progress counts.
 */
export function getGroupStatus(
  group: Pick<ModuleGroup, "totalCount" | "completedCount">,
  modules: Module[],
): ModuleStatus {
  if (modules.length > 0) {
    if (modules.every(m => isModuleComplete(m.status))) return "complete";
    if (modules.some(m => m.status !== "unstarted")) return "in_progress";
    return "unstarted";
  }
  const total = group.totalCount ?? 0;
  const done = group.completedCount ?? 0;
  if (total > 0 && done >= total) return "complete";
  if (done > 0) return "in_progress";
  return "unstarted";
}
