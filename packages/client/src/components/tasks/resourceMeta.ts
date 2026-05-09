import type { TaskResourceLevel } from "@emstack/types/src";

export const RESOURCE_LEVEL_OPTIONS: { value: TaskResourceLevel;
  label: string; }[] = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];

export function getResourceLevelLabel(
  level: TaskResourceLevel | null | undefined,
): string {
  if (!level) {
    return "—";
  }
  return RESOURCE_LEVEL_OPTIONS.find(o => o.value === level)?.label ?? level;
}

export function getResourceLevelClass(
  level: TaskResourceLevel | null | undefined,
): string {
  switch (level) {
    case "low":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200";
    case "high":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
}
