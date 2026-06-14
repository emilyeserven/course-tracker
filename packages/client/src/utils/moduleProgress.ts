import type { Module, ModuleGroup } from "@emstack/types";

import { isModuleComplete } from "@emstack/types";

export interface ModuleProgress {
  completedCount: number;
  totalCount: number;
  /** Integer 0–100; 0 when there are no modules to count. */
  percentComplete: number;
}

/**
 * Aggregate a resource's module progress: count completed/total across
 * enumerated modules plus groups that have NO enumerated modules (those
 * contribute their direct `totalCount`/`completedCount`; when a group has
 * enumerated modules, those modules are already counted).
 */
export function computeModuleProgress(
  modules: Module[],
  groups: ModuleGroup[],
): ModuleProgress {
  const enumeratedGroupIds = new Set(
    modules
      .map(m => m.moduleGroupId)
      .filter((id): id is string => !!id),
  );

  let totalCount = modules.length;
  let completedCount = modules.filter(m => isModuleComplete(m.status)).length;

  for (const g of groups) {
    if (enumeratedGroupIds.has(g.id)) continue;
    totalCount += g.totalCount ?? 0;
    completedCount += g.completedCount ?? 0;
  }

  const percentComplete
    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    percentComplete,
  };
}
