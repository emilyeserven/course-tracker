import type { GroupDraft, ModuleDraft } from "@/components/resources/moduleDrafts";
import type { Module, ModuleGroup, ModulesConfig, Resource } from "@emstack/types";

import { useMemo } from "react";

import { DEFAULT_MODULES_CONFIG } from "@emstack/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { draftToLength, parseCount } from "@/components/resources/moduleDrafts";
import {
  createModule,
  createModuleGroup,
  deleteSingleModule,
  deleteSingleModuleGroup,
  fetchModuleGroups,
  fetchModules,
  fetchSingleResource,
  fetchTagGroups,
  setResourceModulesExhaustive,
  updateResourceModulesConfig,
  upsertModule,
  upsertModuleGroup,
} from "@/utils/fetchFunctions";
import { queryKeys } from "@/utils/queryKeys";

export function useResourceModules(resourceId: string) {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: queryKeys.resources.moduleGroups(resourceId),
    queryFn: () => fetchModuleGroups(),
  });
  const allModulesQuery = useQuery({
    queryKey: queryKeys.resources.modules(resourceId),
    queryFn: () => fetchModules(),
  });
  const tagGroupsQuery = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });
  const resourceQuery = useQuery({
    queryKey: queryKeys.resources.detail(resourceId),
    queryFn: () => fetchSingleResource(resourceId),
  });
  const tagGroups = tagGroupsQuery.data ?? [];
  const modulesAreExhaustive
    = resourceQuery.data?.modulesAreExhaustive ?? false;

  const groups = useMemo(
    () => (groupsQuery.data ?? []).filter(g => g.resourceId === resourceId),
    [groupsQuery.data, resourceId],
  );
  const allModules = useMemo(
    () =>
      (allModulesQuery.data ?? []).filter(m => m.resourceId === resourceId),
    [allModulesQuery.data, resourceId],
  );

  const ungroupedModules = useMemo(
    () => allModules.filter(m => !m.moduleGroupId),
    [allModules],
  );
  const modulesByGroup = useMemo(() => {
    const map = new Map<string, Module[]>();
    for (const m of allModules) {
      if (m.moduleGroupId) {
        const arr = map.get(m.moduleGroupId);
        if (arr) arr.push(m);
        else map.set(m.moduleGroupId, [m]);
      }
    }
    return map;
  }, [allModules]);

  // Aggregate progress: sum enumerated modules + groups-with-counts (only
  // groups that have NO enumerated modules contribute their direct counts;
  // when a group has enumerated modules, those modules are already counted).
  const groupsWithoutModulesCounts = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const g of groups) {
      const hasEnumerated = (modulesByGroup.get(g.id)?.length ?? 0) > 0;
      if (hasEnumerated) continue;
      total += g.totalCount ?? 0;
      completed += g.completedCount ?? 0;
    }
    return {
      total,
      completed,
    };
  }, [groups, modulesByGroup]);

  const completedCount
    = allModules.filter(m => m.isComplete).length
      + groupsWithoutModulesCounts.completed;
  const totalCount = allModules.length + groupsWithoutModulesCounts.total;

  // Book resources get per-module/group page ranges; the edit cards key off this.
  const isBook = resourceQuery.data?.type === "book";
  // Per-resource naming conventions (group vs module labels), with defaults.
  const modulesConfig: ModulesConfig
    = resourceQuery.data?.modulesConfig ?? DEFAULT_MODULES_CONFIG;
  const groupLabel = modulesConfig.groupLabel || DEFAULT_MODULES_CONFIG.groupLabel;
  const moduleLabel
    = modulesConfig.moduleLabel || DEFAULT_MODULES_CONFIG.moduleLabel;

  function invalidateAll() {
    queryClient.invalidateQueries({
      queryKey: queryKeys.resources.moduleGroups(resourceId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.resources.modules(resourceId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.resources.detail(resourceId),
    });
  }

  // Group mutations
  const createGroupMutation = useMutation({
    mutationFn: (draft: GroupDraft) =>
      createModuleGroup({
        resourceId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        pageStart: parseCount(draft.pageStart),
        pageEnd: parseCount(draft.pageEnd),
        totalCount: parseCount(draft.totalCount),
        completedCount: parseCount(draft.completedCount),
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Module group created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upsertGroupMutation = useMutation({
    mutationFn: (draft: GroupDraft) =>
      upsertModuleGroup(draft.id, {
        resourceId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        pageStart: parseCount(draft.pageStart),
        pageEnd: parseCount(draft.pageEnd),
        totalCount: parseCount(draft.totalCount),
        completedCount: parseCount(draft.completedCount),
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Module group saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => deleteSingleModuleGroup(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Module group deleted; member modules ungrouped");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Module mutations
  const createModuleMutation = useMutation({
    mutationFn: ({
      draft,
      groupId,
    }: {
      draft: ModuleDraft;
      groupId: string | null;
    }) =>
      createModule({
        resourceId,
        moduleGroupId: groupId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        length: draftToLength(draft),
        pageStart: parseCount(draft.pageStart),
        pageEnd: parseCount(draft.pageEnd),
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Module created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upsertModuleMutation = useMutation({
    mutationFn: ({
      draft,
      groupId,
      isComplete,
    }: {
      draft: ModuleDraft;
      groupId: string | null;
      isComplete: boolean;
    }) =>
      upsertModule(draft.id, {
        resourceId,
        moduleGroupId: groupId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        length: draftToLength(draft),
        pageStart: parseCount(draft.pageStart),
        pageEnd: parseCount(draft.pageEnd),
        isComplete,
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Module saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: (m: Module) =>
      upsertModule(m.id, {
        resourceId,
        moduleGroupId: m.moduleGroupId ?? null,
        name: m.name,
        description: m.description ?? null,
        url: m.url ?? null,
        length: m.length ?? null,
        pageStart: m.pageStart ?? null,
        pageEnd: m.pageEnd ?? null,
        isComplete: !m.isComplete,
      }),
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => deleteSingleModule(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Module deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Naming conventions: a surgical update of just the resource's group/module
  // labels (own endpoint so the rest of the resource is never re-sent).
  const updateModulesConfigMutation = useMutation({
    mutationFn: (config: ModulesConfig) =>
      updateResourceModulesConfig(resourceId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.detail(resourceId),
      });
      toast.success("Naming conventions saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Reorder helpers — swap a pair of items by setting explicit positions
  // matching their target indices in the sorted list. Other items keep
  // their existing positions; nulls sort last.
  const reorderModulesMutation = useMutation({
    mutationFn: ({
      a,
      aPosition,
      b,
      bPosition,
    }: {
      a: Module;
      aPosition: number;
      b: Module;
      bPosition: number;
    }) =>
      Promise.all([
        upsertModule(a.id, {
          resourceId: a.resourceId,
          moduleGroupId: a.moduleGroupId ?? null,
          name: a.name,
          description: a.description ?? null,
          url: a.url ?? null,
          length: a.length ?? null,
          pageStart: a.pageStart ?? null,
          pageEnd: a.pageEnd ?? null,
          isComplete: a.isComplete,
          position: aPosition,
        }),
        upsertModule(b.id, {
          resourceId: b.resourceId,
          moduleGroupId: b.moduleGroupId ?? null,
          name: b.name,
          description: b.description ?? null,
          url: b.url ?? null,
          length: b.length ?? null,
          pageStart: b.pageStart ?? null,
          pageEnd: b.pageEnd ?? null,
          isComplete: b.isComplete,
          position: bPosition,
        }),
      ]),
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderGroupsMutation = useMutation({
    mutationFn: ({
      a,
      aPosition,
      b,
      bPosition,
    }: {
      a: ModuleGroup;
      aPosition: number;
      b: ModuleGroup;
      bPosition: number;
    }) =>
      Promise.all([
        upsertModuleGroup(a.id, {
          resourceId: a.resourceId,
          name: a.name,
          description: a.description ?? null,
          url: a.url ?? null,
          pageStart: a.pageStart ?? null,
          pageEnd: a.pageEnd ?? null,
          totalCount: a.totalCount ?? null,
          completedCount: a.completedCount ?? null,
          position: aPosition,
        }),
        upsertModuleGroup(b.id, {
          resourceId: b.resourceId,
          name: b.name,
          description: b.description ?? null,
          url: b.url ?? null,
          pageStart: b.pageStart ?? null,
          pageEnd: b.pageEnd ?? null,
          totalCount: b.totalCount ?? null,
          completedCount: b.completedCount ?? null,
          position: bPosition,
        }),
      ]),
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast.error(e.message),
  });

  function moveModule(list: Module[], index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    reorderModulesMutation.mutate({
      a: list[index],
      aPosition: targetIndex,
      b: list[targetIndex],
      bPosition: index,
    });
  }

  function moveGroup(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;
    reorderGroupsMutation.mutate({
      a: groups[index],
      aPosition: targetIndex,
      b: groups[targetIndex],
      bPosition: index,
    });
  }

  const isReordering
    = reorderModulesMutation.isPending || reorderGroupsMutation.isPending;

  // Toggle the resource-level "module list is exhaustive" flag. Optimistic so
  // the checkbox responds instantly; rolls back on error.
  const setModulesExhaustiveMutation = useMutation({
    mutationFn: (value: boolean) =>
      setResourceModulesExhaustive(resourceId, value),
    onMutate: async (value: boolean) => {
      const detailKey = queryKeys.resources.detail(resourceId);
      await queryClient.cancelQueries({
        queryKey: detailKey,
      });
      const previous = queryClient.getQueryData<Resource>(detailKey);
      if (previous) {
        queryClient.setQueryData<Resource>(detailKey, {
          ...previous,
          modulesAreExhaustive: value,
        });
      }
      return {
        previous,
      };
    },
    onError: (e: Error, _value, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.resources.detail(resourceId),
          context.previous,
        );
      }
      toast.error(e.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.detail(resourceId),
      });
    },
  });

  return {
    resourceQuery,
    tagGroups,
    modulesAreExhaustive,
    groups,
    ungroupedModules,
    modulesByGroup,
    completedCount,
    totalCount,
    isBook,
    modulesConfig,
    groupLabel,
    moduleLabel,
    invalidateAll,
    createGroupMutation,
    upsertGroupMutation,
    deleteGroupMutation,
    createModuleMutation,
    upsertModuleMutation,
    toggleCompleteMutation,
    deleteModuleMutation,
    setModulesExhaustiveMutation,
    updateModulesConfigMutation,
    moveModule,
    moveGroup,
    isReordering,
  };
}

/**
 * Everything `useResourceModules` exposes. The module-admin section components
 * accept this controller so the top-level component stays a thin composition
 * over the hook rather than threading a dozen individual props.
 */
export type ResourceModulesController = ReturnType<typeof useResourceModules>;
