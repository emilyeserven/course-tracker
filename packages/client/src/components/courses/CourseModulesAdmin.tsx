import type {
  Module,
  ModuleDurationBucket,
  ModuleGroup,
  ParsedModuleLength,
  Tag,
  TagGroup,
  TaskResourceLevel,
} from "@emstack/types/src";

import { Fragment, useMemo, useState } from "react";

import {
  formatModuleLength,
  MODULE_DURATION_BUCKETS,
  MODULE_DURATION_LABELS,
  parseModuleLength,
} from "@emstack/types/src";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  Loader2,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { InteractionQuickLog } from "./InteractionQuickLog";
import { ModuleSuggestDialog } from "./ModuleSuggestDialog";

import { Input } from "@/components/input";
import { TagChip } from "@/components/tasks/TagChip";
import { TagPicker } from "@/components/tasks/TagPicker";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { isHttpUrl } from "@/utils";
import {
  createModule,
  createModuleGroup,
  deleteSingleModule,
  deleteSingleModuleGroup,
  fetchModuleGroups,
  fetchModules,
  fetchSingleResource,
  fetchTagGroups,
  upsertModule,
  upsertModuleGroup,
} from "@/utils/fetchFunctions";

interface Props {
  resourceId: string;
  modulesAreExhaustive?: boolean;
}

interface GroupDraft {
  id: string;
  name: string;
  description: string;
  url: string;
  totalCount: string;
  completedCount: string;
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  tagIds: string[];
}

type DurationMode = "minutes" | "bucket";

interface ModuleDraft {
  id: string;
  name: string;
  description: string;
  url: string;
  durationMode: DurationMode;
  minutesValue: string;
  bucketValue: ModuleDurationBucket | "";
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  tagIds: string[];
}

const NEW_ID = "__new__";

function emptyGroupDraft(): GroupDraft {
  return {
    id: NEW_ID,
    name: "",
    description: "",
    url: "",
    totalCount: "",
    completedCount: "",
    easeOfStarting: "",
    timeNeeded: "",
    interactivity: "",
    tagIds: [],
  };
}

function groupToDraft(g: ModuleGroup): GroupDraft {
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? "",
    url: g.url ?? "",
    totalCount: g.totalCount != null ? String(g.totalCount) : "",
    completedCount: g.completedCount != null ? String(g.completedCount) : "",
    easeOfStarting: g.easeOfStarting ?? "",
    timeNeeded: g.timeNeeded ?? "",
    interactivity: g.interactivity ?? "",
    tagIds: (g.tags ?? []).map(t => t.id),
  };
}

function emptyModuleDraft(): ModuleDraft {
  return {
    id: NEW_ID,
    name: "",
    description: "",
    url: "",
    durationMode: "minutes",
    minutesValue: "",
    bucketValue: "",
    easeOfStarting: "",
    timeNeeded: "",
    interactivity: "",
    tagIds: [],
  };
}

function moduleToDraft(m: Module): ModuleDraft {
  const parsed: ParsedModuleLength = parseModuleLength(m.length);
  const base = {
    id: m.id,
    name: m.name,
    description: m.description ?? "",
    url: m.url ?? "",
    easeOfStarting: m.easeOfStarting ?? ("" as const),
    timeNeeded: m.timeNeeded ?? ("" as const),
    interactivity: m.interactivity ?? ("" as const),
    tagIds: (m.tags ?? []).map(t => t.id),
  };
  if (parsed?.kind === "bucket") {
    return {
      ...base,
      durationMode: "bucket",
      minutesValue: "",
      bucketValue: parsed.bucket,
    };
  }
  if (parsed?.kind === "minutes") {
    return {
      ...base,
      durationMode: "minutes",
      minutesValue: String(parsed.minutes),
      bucketValue: "",
    };
  }
  return {
    ...base,
    durationMode: "minutes",
    minutesValue: "",
    bucketValue: "",
  };
}

function levelChipClass(level: TaskResourceLevel | null | undefined): string {
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

function GroupMetaChips({
  easeOfStarting,
  timeNeeded,
  interactivity,
  tags,
}: {
  easeOfStarting: TaskResourceLevel | null;
  timeNeeded: TaskResourceLevel | null;
  interactivity: TaskResourceLevel | null;
  tags: Tag[];
}) {
  const hasAny
    = !!easeOfStarting || !!timeNeeded || !!interactivity || tags.length > 0;
  if (!hasAny) return null;
  function chip(label: string, level: TaskResourceLevel | null) {
    if (!level) return null;
    return (
      <span
        className={`
          inline-flex items-center rounded-full border px-2 py-0.5 text-xs
          font-medium
          ${levelChipClass(level)}
        `}
      >
        {label}: {level}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {chip("Ease", easeOfStarting)}
      {chip("Time", timeNeeded)}
      {chip("Interactivity", interactivity)}
      {tags.map(tag => (
        <TagChip
          key={tag.id}
          tag={tag.name}
        />
      ))}
    </div>
  );
}

function lookupTagsByIds(ids: string[], tagGroups: TagGroup[]): Tag[] {
  const byId = new Map<string, Tag>();
  for (const group of tagGroups) {
    for (const tag of group.tags ?? []) {
      byId.set(tag.id, tag);
    }
  }
  return ids.map(id => byId.get(id)).filter((t): t is Tag => t !== undefined);
}

function draftToLength(d: ModuleDraft): string | null {
  if (d.durationMode === "minutes") {
    return d.minutesValue ? d.minutesValue : null;
  }
  return d.bucketValue || null;
}

export function CourseModulesAdmin({
  resourceId,
  modulesAreExhaustive,
}: Props) {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ["course-module-groups", resourceId],
    queryFn: () => fetchModuleGroups(),
  });
  const allModulesQuery = useQuery({
    queryKey: ["course-modules", resourceId],
    queryFn: () => fetchModules(),
  });
  const tagGroupsQuery = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });
  const resourceQuery = useQuery({
    queryKey: ["course", resourceId],
    queryFn: () => fetchSingleResource(resourceId),
  });
  const tagGroups = tagGroupsQuery.data ?? [];

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

  function invalidateAll() {
    queryClient.invalidateQueries({
      queryKey: ["course-module-groups", resourceId],
    });
    queryClient.invalidateQueries({
      queryKey: ["course-modules", resourceId],
    });
    queryClient.invalidateQueries({
      queryKey: ["course", resourceId],
    });
  }

  // Group state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Module state — keyed by either groupId (string) or "__ungrouped__" for top level
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [creatingModuleIn, setCreatingModuleIn] = useState<string | null>(null);

  // Quick-log interaction targets. Either a moduleGroupId or a moduleId is set.
  const [loggingForGroupId, setLoggingForGroupId] = useState<string | null>(
    null,
  );
  const [loggingForModuleId, setLoggingForModuleId] = useState<string | null>(
    null,
  );

  // LLM Assist dialog
  const [llmAssistOpen, setLlmAssistOpen] = useState(false);

  const isAnyEditing
    = editingGroupId !== null
      || creatingGroup
      || editingModuleId !== null
      || creatingModuleIn !== null
      || loggingForGroupId !== null
      || loggingForModuleId !== null;

  function parseCount(s: string): number | null {
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  }

  // Group mutations
  const createGroupMutation = useMutation({
    mutationFn: (draft: GroupDraft) =>
      createModuleGroup({
        resourceId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        totalCount: parseCount(draft.totalCount),
        completedCount: parseCount(draft.completedCount),
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      setCreatingGroup(false);
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
        totalCount: parseCount(draft.totalCount),
        completedCount: parseCount(draft.completedCount),
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      setEditingGroupId(null);
      toast.success("Module group saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => deleteSingleModuleGroup(id),
    onSuccess: () => {
      invalidateAll();
      setEditingGroupId(null);
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
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      setCreatingModuleIn(null);
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
        isComplete,
        easeOfStarting: draft.easeOfStarting || null,
        timeNeeded: draft.timeNeeded || null,
        interactivity: draft.interactivity || null,
        tagIds: draft.tagIds,
      }),
    onSuccess: () => {
      invalidateAll();
      setEditingModuleId(null);
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
        isComplete: !m.isComplete,
      }),
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => deleteSingleModule(id),
    onSuccess: () => {
      invalidateAll();
      setEditingModuleId(null);
      toast.success("Module deleted");
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
          totalCount: a.totalCount ?? null,
          completedCount: a.completedCount ?? null,
          position: aPosition,
        }),
        upsertModuleGroup(b.id, {
          resourceId: b.resourceId,
          name: b.name,
          description: b.description ?? null,
          url: b.url ?? null,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Modules</h2>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} complete
              {modulesAreExhaustive && totalCount > 0 && (
                <span>
                  {" "}
                  · {Math.round((completedCount / totalCount) * 100)}%
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLlmAssistOpen(true)}
            disabled={isAnyEditing}
            title="Suggest module groups and modules via Claude"
          >
            <SparklesIcon className="size-4" />
            LLM Assist
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreatingModuleIn("__ungrouped__")}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            Add Module
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreatingGroup(true)}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            New Group
          </Button>
        </div>
      </div>

      <ModuleSuggestDialog
        open={llmAssistOpen}
        onOpenChange={setLlmAssistOpen}
        resourceId={resourceId}
        resourceName={resourceQuery.data?.name ?? "this resource"}
        onApplied={() => invalidateAll()}
      />

      {creatingGroup && (
        <GroupEditCard
          draft={emptyGroupDraft()}
          hasEnumeratedModules={false}
          tagGroups={tagGroups}
          isNew
          isSaving={createGroupMutation.isPending}
          onSave={d => createGroupMutation.mutate(d)}
          onCancel={() => setCreatingGroup(false)}
        />
      )}

      {/* Ungrouped modules */}
      {(creatingModuleIn === "__ungrouped__"
        || ungroupedModules.length > 0) && (
        <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ungrouped
          </h3>
          {creatingModuleIn === "__ungrouped__" && (
            <ModuleEditCard
              draft={emptyModuleDraft()}
              tagGroups={tagGroups}
              isNew
              isComplete={false}
              isSaving={createModuleMutation.isPending}
              onSave={d =>
                createModuleMutation.mutate({
                  draft: d,
                  groupId: null,
                })}
              onCancel={() => setCreatingModuleIn(null)}
            />
          )}
          <ul className="flex flex-col divide-y rounded-sm border">
            {ungroupedModules.map((m, index) =>
              m.id === editingModuleId
                ? (
                  <ModuleEditCard
                    key={m.id}
                    draft={moduleToDraft(m)}
                    tagGroups={tagGroups}
                    isComplete={m.isComplete}
                    isSaving={
                      upsertModuleMutation.isPending
                      || deleteModuleMutation.isPending
                    }
                    onSave={d =>
                      upsertModuleMutation.mutate({
                        draft: d,
                        groupId: null,
                        isComplete: m.isComplete,
                      })}
                    onCancel={() => setEditingModuleId(null)}
                    onDelete={() => deleteModuleMutation.mutate(m.id)}
                  />
                )
                : (
                  <Fragment key={m.id}>
                    <ModuleDisplayRow
                      module={m}
                      isAnyEditing={isAnyEditing}
                      isReordering={isReordering}
                      canMoveUp={index > 0}
                      canMoveDown={index < ungroupedModules.length - 1}
                      onMoveUp={() => moveModule(ungroupedModules, index, "up")}
                      onMoveDown={() =>
                        moveModule(ungroupedModules, index, "down")}
                      onToggleComplete={() => toggleCompleteMutation.mutate(m)}
                      onEdit={() => setEditingModuleId(m.id)}
                      onLogInteraction={() => setLoggingForModuleId(m.id)}
                      isToggling={toggleCompleteMutation.isPending}
                    />
                    {loggingForModuleId === m.id && (
                      <li className="border-t bg-muted/30 p-3">
                        <InteractionQuickLog
                          resourceId={resourceId}
                          moduleId={m.id}
                          scopeLabel={`module: ${m.name}`}
                          onCancel={() => setLoggingForModuleId(null)}
                          onSaved={() => setLoggingForModuleId(null)}
                        />
                      </li>
                    )}
                  </Fragment>
                ))}
          </ul>
        </div>
      )}

      {/* Module Groups */}
      {groups.map((g, gIndex) => {
        const groupModules = modulesByGroup.get(g.id) ?? [];
        const isEditing = editingGroupId === g.id;
        const isCreatingHere = creatingModuleIn === g.id;

        if (isEditing) {
          return (
            <GroupEditCard
              key={g.id}
              draft={groupToDraft(g)}
              hasEnumeratedModules={groupModules.length > 0}
              tagGroups={tagGroups}
              isSaving={
                upsertGroupMutation.isPending || deleteGroupMutation.isPending
              }
              onSave={d => upsertGroupMutation.mutate(d)}
              onCancel={() => setEditingGroupId(null)}
              onDelete={() => deleteGroupMutation.mutate(g.id)}
            />
          );
        }

        return (
          <div
            key={g.id}
            className="flex flex-col gap-2 rounded-md border bg-background p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium">
                  {g.url
                    ? (
                      isHttpUrl(g.url)
                        ? (
                          <a
                            href={g.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-600"
                          >
                            {g.name}
                            {" "}
                            <ExternalLinkIcon className="inline size-3.5" />
                          </a>
                        )
                        : (
                          <span title={g.url}>{g.name}</span>
                        )
                    )
                    : (
                      g.name
                    )}
                </h3>
                {g.description && (
                  <span className="text-xs text-muted-foreground">
                    {g.description}
                  </span>
                )}
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => moveGroup(gIndex, "up")}
                    disabled={isAnyEditing || isReordering || gIndex === 0}
                    aria-label="Move group up"
                    title="Move group up"
                  >
                    <ChevronUpIcon className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => moveGroup(gIndex, "down")}
                    disabled={
                      isAnyEditing
                      || isReordering
                      || gIndex === groups.length - 1
                    }
                    aria-label="Move group down"
                    title="Move group down"
                  >
                    <ChevronDownIcon className="size-3.5" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCreatingModuleIn(g.id)}
                  disabled={isAnyEditing}
                >
                  <PlusIcon className="size-3.5" />
                  Add Module
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setLoggingForGroupId(g.id)}
                  disabled={isAnyEditing}
                  aria-label={`Log interaction for ${g.name}`}
                  title="Log interaction"
                >
                  <ActivityIcon className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingGroupId(g.id)}
                  disabled={isAnyEditing}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
              </div>
            </div>
            <GroupMetaChips
              easeOfStarting={g.easeOfStarting ?? null}
              timeNeeded={g.timeNeeded ?? null}
              interactivity={g.interactivity ?? null}
              tags={g.tags ?? []}
            />
            {loggingForGroupId === g.id && (
              <InteractionQuickLog
                resourceId={resourceId}
                moduleGroupId={g.id}
                scopeLabel={`group: ${g.name}`}
                onCancel={() => setLoggingForGroupId(null)}
                onSaved={() => setLoggingForGroupId(null)}
              />
            )}
            {isCreatingHere && (
              <ModuleEditCard
                draft={emptyModuleDraft()}
                tagGroups={tagGroups}
                isNew
                isComplete={false}
                isSaving={createModuleMutation.isPending}
                onSave={d =>
                  createModuleMutation.mutate({
                    draft: d,
                    groupId: g.id,
                  })}
                onCancel={() => setCreatingModuleIn(null)}
              />
            )}
            {groupModules.length > 0 && (
              <ul className="flex flex-col divide-y rounded-sm border">
                {groupModules.map((m, mIndex) =>
                  m.id === editingModuleId
                    ? (
                      <ModuleEditCard
                        key={m.id}
                        draft={moduleToDraft(m)}
                        tagGroups={tagGroups}
                        isComplete={m.isComplete}
                        isSaving={
                          upsertModuleMutation.isPending
                          || deleteModuleMutation.isPending
                        }
                        onSave={d =>
                          upsertModuleMutation.mutate({
                            draft: d,
                            groupId: g.id,
                            isComplete: m.isComplete,
                          })}
                        onCancel={() => setEditingModuleId(null)}
                        onDelete={() => deleteModuleMutation.mutate(m.id)}
                      />
                    )
                    : (
                      <Fragment key={m.id}>
                        <ModuleDisplayRow
                          module={m}
                          isAnyEditing={isAnyEditing}
                          isReordering={isReordering}
                          canMoveUp={mIndex > 0}
                          canMoveDown={mIndex < groupModules.length - 1}
                          onMoveUp={() => moveModule(groupModules, mIndex, "up")}
                          onMoveDown={() =>
                            moveModule(groupModules, mIndex, "down")}
                          onToggleComplete={() =>
                            toggleCompleteMutation.mutate(m)}
                          onEdit={() => setEditingModuleId(m.id)}
                          onLogInteraction={() => setLoggingForModuleId(m.id)}
                          isToggling={toggleCompleteMutation.isPending}
                        />
                        {loggingForModuleId === m.id && (
                          <li className="border-t bg-muted/30 p-3">
                            <InteractionQuickLog
                              resourceId={resourceId}
                              moduleId={m.id}
                              scopeLabel={`module: ${m.name}`}
                              onCancel={() => setLoggingForModuleId(null)}
                              onSaved={() => setLoggingForModuleId(null)}
                            />
                          </li>
                        )}
                      </Fragment>
                    ))}
              </ul>
            )}
            {groupModules.length === 0
              && !isCreatingHere
              && (g.totalCount != null || g.completedCount != null) && (
              <p className="text-xs text-muted-foreground">
                {g.completedCount ?? 0}
                {" / "}
                {g.totalCount ?? 0}
                {" complete"}
              </p>
            )}
            {groupModules.length === 0
              && !isCreatingHere
              && g.totalCount == null
              && g.completedCount == null && (
              <p className="text-xs text-muted-foreground">
                No modules in this group yet — add modules, or edit the group
                to track totals directly.
              </p>
            )}
          </div>
        );
      })}

      {groups.length === 0
        && ungroupedModules.length === 0
        && !creatingGroup
        && creatingModuleIn === null && (
        <p className="text-sm text-muted-foreground">
          No modules yet. Add a module directly, or create a module group to
          organize them.
        </p>
      )}
    </div>
  );
}

function ModuleDisplayRow({
  module: m,
  isAnyEditing,
  isReordering,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleComplete,
  onEdit,
  onLogInteraction,
  isToggling,
}: {
  module: Module;
  isAnyEditing: boolean;
  isReordering: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onLogInteraction: () => void;
  isToggling: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 px-2 py-1.5">
      <label className="flex flex-1 items-center gap-2">
        <input
          type="checkbox"
          checked={m.isComplete}
          onChange={onToggleComplete}
          disabled={isAnyEditing || isToggling}
          className="size-4"
        />
        <span
          className={
            m.isComplete
              ? "text-sm text-muted-foreground line-through"
              : "text-sm"
          }
        >
          {m.name}
        </span>
        {m.url && isHttpUrl(m.url) && (
          <a
            href={m.url}
            target="_blank"
            rel="noreferrer"
            className="
              text-xs text-muted-foreground
              hover:text-blue-600
            "
            onClick={e => e.stopPropagation()}
          >
            <ExternalLinkIcon className="inline size-3" />
          </a>
        )}
        {formatModuleLength(m.length) && (
          <span className="text-xs text-muted-foreground">
            {formatModuleLength(m.length)}
          </span>
        )}
      </label>
      <div className="flex items-center gap-0.5">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onMoveUp}
          disabled={isAnyEditing || isReordering || !canMoveUp}
          aria-label="Move up"
          title="Move up"
        >
          <ChevronUpIcon className="size-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onMoveDown}
          disabled={isAnyEditing || isReordering || !canMoveDown}
          aria-label="Move down"
          title="Move down"
        >
          <ChevronDownIcon className="size-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onLogInteraction}
          disabled={isAnyEditing}
          aria-label={`Log interaction for ${m.name}`}
          title="Log interaction"
        >
          <ActivityIcon className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          disabled={isAnyEditing}
        >
          <PencilIcon className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

function GroupEditCard({
  draft: initial,
  hasEnumeratedModules,
  tagGroups,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: GroupDraft;
  hasEnumeratedModules: boolean;
  tagGroups: TagGroup[];
  isNew?: boolean;
  isSaving?: boolean;
  onSave: (d: GroupDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<GroupDraft>(initial);
  function update(patch: Partial<GroupDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Group Name
        </label>
        <Input
          type="text"
          value={draft.name}
          onChange={e =>
            update({
              name: e.target.value,
            })}
          required
          autoFocus
          placeholder="e.g. Section 1: Fundamentals"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Description (optional)
        </label>
        <Textarea
          value={draft.description}
          onChange={e =>
            update({
              description: e.target.value,
            })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          URL (optional)
        </label>
        <Input
          type="text"
          value={draft.url}
          onChange={e =>
            update({
              url: e.target.value,
            })}
        />
      </div>
      {!hasEnumeratedModules && (
        <fieldset
          className="flex flex-col gap-2 rounded-md border border-border/60 p-2"
        >
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Direct counts (no enumerated modules)
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Completed
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.completedCount}
                onChange={e =>
                  update({
                    completedCount: e.target.value,
                  })}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Total
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.totalCount}
                onChange={e =>
                  update({
                    totalCount: e.target.value,
                  })}
                placeholder="0"
              />
            </div>
          </div>
        </fieldset>
      )}
      {hasEnumeratedModules && (
        <p className="text-xs text-muted-foreground">
          This group has enumerated modules; counts are derived from them.
          Remove all modules to switch to direct counts.
        </p>
      )}
      <LevelTriad
        easeOfStarting={draft.easeOfStarting}
        timeNeeded={draft.timeNeeded}
        interactivity={draft.interactivity}
        onChange={patch => update(patch)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <TagPicker
          value={draft.tagIds}
          onChange={ids =>
            update({
              tagIds: lookupTagsByIds(ids, tagGroups).map(t => t.id),
            })}
          tagGroups={tagGroups}
          placeholder={
            tagGroups.length > 0
              ? "Pick tags..."
              : "No tags configured. Add some on the Settings page."
          }
        />
      </div>
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-row gap-2">
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
        {onDelete && !isNew && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isSaving}
          >
            <Trash2Icon className="size-4" />
            Remove Group
          </Button>
        )}
      </div>
    </form>
  );
}

function LevelTriad({
  easeOfStarting,
  timeNeeded,
  interactivity,
  onChange,
}: {
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  onChange: (
    patch: Partial<{
      easeOfStarting: TaskResourceLevel | "";
      timeNeeded: TaskResourceLevel | "";
      interactivity: TaskResourceLevel | "";
    }>,
  ) => void;
}) {
  function levelSelect(
    label: string,
    value: TaskResourceLevel | "",
    key: "easeOfStarting" | "timeNeeded" | "interactivity",
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <select
          value={value}
          onChange={e =>
            onChange({
              [key]: (e.target.value || "") as TaskResourceLevel | "",
            })}
          className="
            flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
          "
        >
          <option value="">—</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </div>
    );
  }
  return (
    <div
      className="
        grid grid-cols-1 gap-3
        md:grid-cols-3
      "
    >
      {levelSelect("Ease of Starting", easeOfStarting, "easeOfStarting")}
      {levelSelect("Time Needed", timeNeeded, "timeNeeded")}
      {levelSelect("Interactivity", interactivity, "interactivity")}
    </div>
  );
}

function ModuleEditCard({
  draft: initial,
  tagGroups,
  isNew = false,
  isComplete: _isComplete,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: ModuleDraft;
  tagGroups: TagGroup[];
  isNew?: boolean;
  isComplete: boolean;
  isSaving?: boolean;
  onSave: (d: ModuleDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<ModuleDraft>(initial);
  function update(patch: Partial<ModuleDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="flex flex-col gap-2 rounded-sm border bg-muted/40 p-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Module Name
        </label>
        <Input
          type="text"
          value={draft.name}
          onChange={e =>
            update({
              name: e.target.value,
            })}
          required
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          URL (optional)
        </label>
        <Input
          type="text"
          value={draft.url}
          onChange={e =>
            update({
              url: e.target.value,
            })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Length (optional)
          </label>
          <div
            className="flex items-center rounded-md border border-input"
            role="group"
            aria-label="Length mode"
          >
            <Button
              type="button"
              size="sm"
              variant={draft.durationMode === "minutes" ? "secondary" : "ghost"}
              aria-pressed={draft.durationMode === "minutes"}
              onClick={() =>
                update({
                  durationMode: "minutes",
                })}
            >
              Minutes
            </Button>
            <Button
              type="button"
              size="sm"
              variant={draft.durationMode === "bucket" ? "secondary" : "ghost"}
              aria-pressed={draft.durationMode === "bucket"}
              onClick={() =>
                update({
                  durationMode: "bucket",
                })}
            >
              Range
            </Button>
          </div>
        </div>
        {draft.durationMode === "minutes"
          ? (
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.minutesValue}
              onChange={e =>
                update({
                  minutesValue: e.target.value,
                })}
              placeholder="e.g. 30"
            />
          )
          : (
            <select
              value={draft.bucketValue}
              onChange={e =>
                update({
                  bucketValue: (e.target.value || "") as
                  | ModuleDurationBucket
                  | "",
                })}
              className="
                flex h-9 w-full rounded-md border bg-background px-3 py-1
                text-sm
              "
            >
              <option value="">— Select a range —</option>
              {MODULE_DURATION_BUCKETS.map(b => (
                <option
                  key={b}
                  value={b}
                >
                  {MODULE_DURATION_LABELS[b]}
                </option>
              ))}
            </select>
          )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Description (optional)
        </label>
        <Textarea
          value={draft.description}
          onChange={e =>
            update({
              description: e.target.value,
            })}
        />
      </div>
      <LevelTriad
        easeOfStarting={draft.easeOfStarting}
        timeNeeded={draft.timeNeeded}
        interactivity={draft.interactivity}
        onChange={patch => update(patch)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <TagPicker
          value={draft.tagIds}
          onChange={ids =>
            update({
              tagIds: lookupTagsByIds(ids, tagGroups).map(t => t.id),
            })}
          tagGroups={tagGroups}
          placeholder={
            tagGroups.length > 0
              ? "Pick tags..."
              : "No tags configured. Add some on the Settings page."
          }
        />
      </div>
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-row gap-2">
          <Button
            size="sm"
            type="submit"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Save
          </Button>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
        {onDelete && !isNew && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isSaving}
          >
            <Trash2Icon className="size-3.5" />
            Remove
          </Button>
        )}
      </div>
    </form>
  );
}

export type { Props as CourseModulesAdminProps };
