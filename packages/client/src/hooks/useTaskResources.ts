import type { Task, TaskResource } from "@emstack/types";

import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchModuleGroups,
  fetchModules,
  fetchResources,
  upsertTask,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

interface UseTaskResourcesOptions {
  task: Task;
  /** Called after a successful edit save (after invalidation). */
  onEditSaved: () => void;
  /** Called after a successful create (after invalidation). */
  onNewSaved: () => void;
  /** Called after a successful delete (after invalidation). */
  onDeleted: () => void;
}

/**
 * Data layer for the task ResourcesTable: the linkable-resource queries,
 * the sorted link options, and the task-resources upsert mutation with its
 * row-level handlers.
 */
export function useTaskResources({
  task,
  onEditSaved,
  onNewSaved,
  onDeleted,
}: UseTaskResourcesOptions) {
  const queryClient = useQueryClient();
  const resources = task.resources ?? [];

  const {
    data: courses,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });
  const {
    data: allModuleGroups,
  } = useQuery({
    queryKey: ["module-groups-all"],
    queryFn: () => fetchModuleGroups(),
  });
  const {
    data: allModules,
  } = useQuery({
    queryKey: ["modules-all"],
    queryFn: () => fetchModules(),
  });
  const resourceOptions = useMemo(
    () =>
      [...(courses ?? [])]
        .map(c => ({
          id: c.id,
          name: c.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [courses],
  );

  const mutation = useMutation({
    mutationFn: (next: TaskResource[]) =>
      upsertTask(task.id, {
        name: task.name,
        description: task.description ?? null,
        topicId: task.topicId ?? null,
        taskTypeId: task.taskTypeId ?? null,
        resources: next.map(r => ({
          id: r.id,
          name: r.name,
          url: r.url ?? null,
          usedYet: r.usedYet,
          resourceId: r.resourceId ?? null,
          moduleGroupId: r.resourceId ? (r.moduleGroupId ?? null) : null,
          moduleId: r.resourceId ? (r.moduleId ?? null) : null,
        })),
        todos: (task.todos ?? []).map(t => ({
          id: t.id,
          name: t.name,
          isComplete: t.isComplete,
          url: t.url ?? null,
        })),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
      ]);
    },
    onError: () => {
      toast.error("Failed to update resource.");
    },
  });

  function handleToggleUsed(resourceId: string, nextUsed: boolean) {
    const next = resources.map(r =>
      r.id === resourceId
        ? {
          ...r,
          usedYet: nextUsed,
        }
        : r);
    mutation.mutate(next);
  }

  function handleSaveEdit(updated: TaskResource) {
    const next = resources.map(r => (r.id === updated.id ? updated : r));
    mutation.mutate(next, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["task", task.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tasks"],
          }),
        ]);
        onEditSaved();
      },
    });
  }

  function handleSaveNew(created: TaskResource) {
    const next = [...resources, created];
    mutation.mutate(next, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["task", task.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tasks"],
          }),
        ]);
        onNewSaved();
      },
    });
  }

  function handleDelete(id: string) {
    const next = resources.filter(r => r.id !== id);
    mutation.mutate(next, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["task", task.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tasks"],
          }),
        ]);
        onDeleted();
      },
    });
  }

  return {
    resources,
    allModuleGroups,
    allModules,
    resourceOptions,
    mutation,
    handleToggleUsed,
    handleSaveEdit,
    handleSaveNew,
    handleDelete,
  };
}
