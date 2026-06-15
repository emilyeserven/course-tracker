import type { GroupProgress, ModuleProgress } from "@/utils/moduleProgress";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { fetchModuleGroups, fetchModules } from "@/utils/fetchFunctions";
import { computeGroupProgress, computeModuleProgress } from "@/utils/moduleProgress";
import { queryKeys } from "@/utils/queryKeys";

export interface ResourceModuleProgress {
  /** Overall module-derived progress (completed/total/% across the resource). */
  progress: ModuleProgress;
  /** Per-group breakdown for the Details-tab progress table. */
  groups: GroupProgress[];
}

/**
 * Read-only module progress for a resource, used by the Details tab to show
 * module-derived progress when the resource is in Module Tracking mode.
 *
 * Shares query keys/fetchers with `useResourceModules`, so the cache is reused
 * when the Modules tab is also mounted. Gate fetching with `enabled` so manual
 * progress resources don't fetch modules they never display.
 */
export function useResourceModuleProgress(
  resourceId: string,
  enabled: boolean,
): ResourceModuleProgress {
  const groupsQuery = useQuery({
    queryKey: queryKeys.resources.moduleGroups(resourceId),
    queryFn: () => fetchModuleGroups(),
    enabled,
  });
  const modulesQuery = useQuery({
    queryKey: queryKeys.resources.modules(resourceId),
    queryFn: () => fetchModules(),
    enabled,
  });

  return useMemo(() => {
    const groups = (groupsQuery.data ?? []).filter(
      g => g.resourceId === resourceId,
    );
    const modules = (modulesQuery.data ?? []).filter(
      m => m.resourceId === resourceId,
    );
    return {
      progress: computeModuleProgress(modules, groups),
      groups: computeGroupProgress(modules, groups),
    };
  }, [groupsQuery.data, modulesQuery.data, resourceId]);
}
