import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { fetchResources, fetchTasks } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

// Task / resource id → display-name maps for resolving weekly schedule
// entries. Weekly grids carry unresolved ids, so consumers look names up
// from the (shared, cached) task/resource lists. Pass enabled=false to
// skip the fetches when names aren't needed — the maps stay empty.
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

  const taskNames = useMemo(
    () => new Map((tasks ?? []).map(t => [t.id, t.name])),
    [tasks],
  );
  const resourceNames = useMemo(
    () => new Map((resources ?? []).map(r => [r.id, r.name])),
    [resources],
  );

  return {
    taskNames,
    resourceNames,
  };
}
