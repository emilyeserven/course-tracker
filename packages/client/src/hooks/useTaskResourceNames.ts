import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  fetchModuleGroups,
  fetchModules,
  fetchResources,
  fetchTasks,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

// Task / resource / module / module-group id → display-name maps for resolving
// weekly schedule entries. Weekly grids carry unresolved ids (a resource entry
// may further narrow to a module or group), so consumers look names up from the
// (shared, cached) lists. Pass enabled=false to skip the fetches when names
// aren't needed — the maps stay empty.
export function useTaskResourceNames(enabled = true) {
  const {
    data: tasks,
  } = useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: () => fetchTasks(),
    enabled,
  });
  const {
    data: resources,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
    enabled,
  });
  const {
    data: modules,
  } = useQuery({
    queryKey: queryKeys.modules.list(),
    queryFn: () => fetchModules(),
    enabled,
  });
  const {
    data: moduleGroups,
  } = useQuery({
    queryKey: queryKeys.moduleGroups.list(),
    queryFn: () => fetchModuleGroups(),
    enabled,
  });

  const taskNames = useMemo(
    () => new Map((tasks ?? []).map(t => [t.id, t.name])),
    [tasks],
  );
  const resourceNames = useMemo(
    () => new Map((resources ?? []).map(r => [r.id, r.name])),
    [resources],
  );
  const moduleNames = useMemo(
    () => new Map((modules ?? []).map(m => [m.id, m.name])),
    [modules],
  );
  const moduleGroupNames = useMemo(
    () => new Map((moduleGroups ?? []).map(g => [g.id, g.name])),
    [moduleGroups],
  );

  return {
    taskNames,
    resourceNames,
    moduleNames,
    moduleGroupNames,
  };
}
