import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { fetchTasks } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

// Task id → display-name map for resolving weekly schedule entries. Weekly grids
// carry unresolved task ids, so consumers look names up from the (shared, cached)
// task list. Pass enabled=false to skip the fetch when names aren't needed — the
// map stays empty.
export function useTaskResourceNames(enabled = true) {
  const {
    data: tasks,
  } = useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: () => fetchTasks(),
    enabled,
  });

  const taskNames = useMemo(
    () => new Map((tasks ?? []).map(t => [t.id, t.name])),
    [tasks],
  );

  return {
    taskNames,
  };
}
