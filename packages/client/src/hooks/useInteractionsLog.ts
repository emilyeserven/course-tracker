import type {
  InteractionDifficulty,
  InteractionProgress,
  InteractionUnderstanding,
} from "@emstack/types";

import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createInteraction,
  deleteSingleInteraction,
  fetchInteractions,
  fetchModuleGroups,
  fetchModules,
  fetchResourceRoutineInteractions,
  upsertInteraction,
} from "@/utils/fetchFunctions";
import { queryKeys } from "@/utils/queryKeys";

export interface InteractionDraft {
  id: string;
  date: string;
  progress: InteractionProgress;
  note: string;
  difficulty: InteractionDifficulty | "";
  understanding: InteractionUnderstanding | "";
  moduleGroupId: string;
  moduleId: string;
}

export function useInteractionsLog(resourceId: string) {
  const queryClient = useQueryClient();

  const interactionsQuery = useQuery({
    queryKey: queryKeys.resources.interactions(resourceId),
    queryFn: () => fetchInteractions(),
  });

  const moduleGroupsQuery = useQuery({
    queryKey: queryKeys.resources.moduleGroups(resourceId),
    queryFn: () => fetchModuleGroups(),
  });

  const modulesQuery = useQuery({
    queryKey: queryKeys.resources.modules(resourceId),
    queryFn: () => fetchModules(),
  });

  // Routine completions whose day-action touched this resource (derived
  // server-side). Read-only — surfaced alongside the manually-logged interactions.
  const routineInteractionsQuery = useQuery({
    queryKey: queryKeys.resources.routineInteractions(resourceId),
    queryFn: () => fetchResourceRoutineInteractions(resourceId),
  });

  const allInteractions = interactionsQuery.data ?? [];
  const interactions = allInteractions.filter(i => i.resourceId === resourceId);
  const routineInteractions = routineInteractionsQuery.data ?? [];

  const moduleGroups = useMemo(
    () =>
      (moduleGroupsQuery.data ?? []).filter(g => g.resourceId === resourceId),
    [moduleGroupsQuery.data, resourceId],
  );
  const modules = useMemo(
    () => (modulesQuery.data ?? []).filter(m => m.resourceId === resourceId),
    [modulesQuery.data, resourceId],
  );

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: queryKeys.resources.interactions(resourceId),
    });
  }

  const upsertMutation = useMutation({
    mutationFn: (d: InteractionDraft) =>
      upsertInteraction(d.id, {
        resourceId,
        moduleGroupId: d.moduleGroupId || null,
        moduleId: d.moduleId || null,
        date: d.date,
        progress: d.progress,
        note: d.note || null,
        difficulty: d.difficulty || null,
        understanding: d.understanding || null,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Interaction saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: (d: InteractionDraft) =>
      createInteraction({
        resourceId,
        moduleGroupId: d.moduleGroupId || null,
        moduleId: d.moduleId || null,
        date: d.date,
        progress: d.progress,
        note: d.note || null,
        difficulty: d.difficulty || null,
        understanding: d.understanding || null,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Interaction logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSingleInteraction(id),
    onSuccess: () => {
      invalidate();
      toast.success("Interaction deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    interactions,
    routineInteractions,
    moduleGroups,
    modules,
    createMutation,
    upsertMutation,
    deleteMutation,
  };
}
