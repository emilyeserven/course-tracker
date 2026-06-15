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

export interface GroupProgress {
  id: string;
  name: string;
  /** Enumerated module count, or the group's direct `totalCount` when empty. */
  moduleCount: number;
  /** Completed enumerated modules, or the direct `completedCount` when empty. */
  completedCount: number;
  /** Integer 0–100; 0 when the group has nothing to count. */
  percentComplete: number;
  /** True when every counted module is done (and there is something to count). */
  isComplete: boolean;
}

/**
 * Per-group progress breakdown for a resource. Mirrors `computeModuleProgress`'s
 * rule at the group level: a group with enumerated modules is measured by those
 * modules' statuses; a group without them falls back to its direct
 * `totalCount`/`completedCount`. Sorted by `position` then name for stable display.
 */
export function computeGroupProgress(
  modules: Module[],
  groups: ModuleGroup[],
): GroupProgress[] {
  const modulesByGroup = new Map<string, Module[]>();
  for (const m of modules) {
    if (!m.moduleGroupId) continue;
    const arr = modulesByGroup.get(m.moduleGroupId);
    if (arr) arr.push(m);
    else modulesByGroup.set(m.moduleGroupId, [m]);
  }

  return [...groups]
    .sort(
      (a, b) =>
        (a.position ?? Infinity) - (b.position ?? Infinity)
        || a.name.localeCompare(b.name),
    )
    .map((g) => {
      const enumerated = modulesByGroup.get(g.id) ?? [];
      const hasEnumerated = enumerated.length > 0;
      const moduleCount = hasEnumerated ? enumerated.length : g.totalCount ?? 0;
      const completedCount = hasEnumerated
        ? enumerated.filter(m => isModuleComplete(m.status)).length
        : g.completedCount ?? 0;
      const percentComplete
        = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;

      return {
        id: g.id,
        name: g.name,
        moduleCount,
        completedCount,
        percentComplete,
        isComplete: moduleCount > 0 && completedCount >= moduleCount,
      };
    });
}
