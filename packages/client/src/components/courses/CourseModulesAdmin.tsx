import type { Module } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  Loader2,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
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
  upsertModule,
  upsertModuleGroup,
} from "@/utils/fetchFunctions";

// TODO(modules-ordering-followup): add a reorder UI here.
// Both `moduleGroups.position` and `modules.position` columns exist and
// list/get queries already sort by position ASC, so the back-end is ready.
// What's missing is a UX to set the order:
//   - reorder Module Groups + ungrouped Modules at the top level
//   - reorder Modules within a single Group
// Likely shape: drag handles on rows, or up/down buttons. On reorder, PUT
// each affected row's `position` (or batch via a dedicated reorder endpoint
// if drift becomes a problem).
interface Props {
  courseId: string;
  modulesAreExhaustive?: boolean;
}

interface GroupDraft {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface ModuleDraft {
  id: string;
  name: string;
  description: string;
  url: string;
  minutesLength: string;
}

const NEW_ID = "__new__";

function emptyGroupDraft(): GroupDraft {
  return {
    id: NEW_ID,
    name: "",
    description: "",
    url: "",
  };
}

function emptyModuleDraft(): ModuleDraft {
  return {
    id: NEW_ID,
    name: "",
    description: "",
    url: "",
    minutesLength: "",
  };
}

export function CourseModulesAdmin({
  courseId,
  modulesAreExhaustive,
}: Props) {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ["course-module-groups", courseId],
    queryFn: () => fetchModuleGroups(),
  });
  const allModulesQuery = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: () => fetchModules(),
  });

  const groups = useMemo(
    () => (groupsQuery.data ?? []).filter(g => g.courseId === courseId),
    [groupsQuery.data, courseId],
  );
  const allModules = useMemo(
    () => (allModulesQuery.data ?? []).filter(m => m.courseId === courseId),
    [allModulesQuery.data, courseId],
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

  const completedCount = allModules.filter(m => m.isComplete).length;
  const totalCount = allModules.length;

  function invalidateAll() {
    queryClient.invalidateQueries({
      queryKey: ["course-module-groups", courseId],
    });
    queryClient.invalidateQueries({
      queryKey: ["course-modules", courseId],
    });
    queryClient.invalidateQueries({
      queryKey: ["course", courseId],
    });
  }

  // Group state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Module state — keyed by either groupId (string) or "__ungrouped__" for top level
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [creatingModuleIn, setCreatingModuleIn] = useState<string | null>(null);

  const isAnyEditing
    = editingGroupId !== null
      || creatingGroup
      || editingModuleId !== null
      || creatingModuleIn !== null;

  // Group mutations
  const createGroupMutation = useMutation({
    mutationFn: (draft: GroupDraft) =>
      createModuleGroup({
        courseId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
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
        courseId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
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
        courseId,
        moduleGroupId: groupId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        minutesLength: draft.minutesLength
          ? Number(draft.minutesLength)
          : null,
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
        courseId,
        moduleGroupId: groupId,
        name: draft.name,
        description: draft.description || null,
        url: draft.url || null,
        minutesLength: draft.minutesLength
          ? Number(draft.minutesLength)
          : null,
        isComplete,
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
        courseId,
        moduleGroupId: m.moduleGroupId ?? null,
        name: m.name,
        description: m.description ?? null,
        url: m.url ?? null,
        minutesLength: m.minutesLength ?? null,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Modules</h2>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedCount}
              {" "}
              of
              {" "}
              {totalCount}
              {" "}
              complete
              {modulesAreExhaustive && totalCount > 0 && (
                <span>
                  {" "}
                  ·
                  {" "}
                  {Math.round((completedCount / totalCount) * 100)}
                  %
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-row gap-2">
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

      {creatingGroup && (
        <GroupEditCard
          draft={emptyGroupDraft()}
          isNew
          isSaving={createGroupMutation.isPending}
          onSave={d => createGroupMutation.mutate(d)}
          onCancel={() => setCreatingGroup(false)}
        />
      )}

      {/* Ungrouped modules */}
      {(creatingModuleIn === "__ungrouped__" || ungroupedModules.length > 0) && (
        <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ungrouped
          </h3>
          {creatingModuleIn === "__ungrouped__" && (
            <ModuleEditCard
              draft={emptyModuleDraft()}
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
            {ungroupedModules.map(m =>
              m.id === editingModuleId
                ? (
                  <ModuleEditCard
                    key={m.id}
                    draft={{
                      id: m.id,
                      name: m.name,
                      description: m.description ?? "",
                      url: m.url ?? "",
                      minutesLength: m.minutesLength?.toString() ?? "",
                    }}
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
                  <ModuleDisplayRow
                    key={m.id}
                    module={m}
                    isAnyEditing={isAnyEditing}
                    onToggleComplete={() => toggleCompleteMutation.mutate(m)}
                    onEdit={() => setEditingModuleId(m.id)}
                    isToggling={toggleCompleteMutation.isPending}
                  />
                ))}
          </ul>
        </div>
      )}

      {/* Module Groups */}
      {groups.map((g) => {
        const groupModules = modulesByGroup.get(g.id) ?? [];
        const isEditing = editingGroupId === g.id;
        const isCreatingHere = creatingModuleIn === g.id;

        if (isEditing) {
          return (
            <GroupEditCard
              key={g.id}
              draft={{
                id: g.id,
                name: g.name,
                description: g.description ?? "",
                url: g.url ?? "",
              }}
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
                    ? (isHttpUrl(g.url)
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
                      ))
                    : g.name}
                </h3>
                {g.description && (
                  <span className="text-xs text-muted-foreground">
                    {g.description}
                  </span>
                )}
              </div>
              <div className="flex flex-row gap-2">
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
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingGroupId(g.id)}
                  disabled={isAnyEditing}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
              </div>
            </div>
            {isCreatingHere && (
              <ModuleEditCard
                draft={emptyModuleDraft()}
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
                {groupModules.map(m =>
                  m.id === editingModuleId
                    ? (
                      <ModuleEditCard
                        key={m.id}
                        draft={{
                          id: m.id,
                          name: m.name,
                          description: m.description ?? "",
                          url: m.url ?? "",
                          minutesLength: m.minutesLength?.toString() ?? "",
                        }}
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
                      <ModuleDisplayRow
                        key={m.id}
                        module={m}
                        isAnyEditing={isAnyEditing}
                        onToggleComplete={() => toggleCompleteMutation.mutate(m)}
                        onEdit={() => setEditingModuleId(m.id)}
                        isToggling={toggleCompleteMutation.isPending}
                      />
                    ))}
              </ul>
            )}
            {groupModules.length === 0 && !isCreatingHere && (
              <p className="text-xs text-muted-foreground">
                No modules in this group yet.
              </p>
            )}
          </div>
        );
      })}

      {groups.length === 0 && ungroupedModules.length === 0 && !creatingGroup
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
  onToggleComplete,
  onEdit,
  isToggling,
}: {
  module: Module;
  isAnyEditing: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
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
        {m.minutesLength != null && (
          <span className="text-xs text-muted-foreground">
            {m.minutesLength}
            m
          </span>
        )}
      </label>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        disabled={isAnyEditing}
      >
        <PencilIcon className="size-3.5" />
      </Button>
    </li>
  );
}

function GroupEditCard({
  draft: initial,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: GroupDraft;
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
          onChange={e => update({
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
          onChange={e => update({
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
          onChange={e => update({
            url: e.target.value,
          })}
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

function ModuleEditCard({
  draft: initial,
  isNew = false,
  isComplete: _isComplete,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: ModuleDraft;
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
          onChange={e => update({
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
          onChange={e => update({
            url: e.target.value,
          })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Minutes (optional)
        </label>
        <Input
          type="number"
          value={draft.minutesLength}
          onChange={e => update({
            minutesLength: e.target.value,
          })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Description (optional)
        </label>
        <Textarea
          value={draft.description}
          onChange={e => update({
            description: e.target.value,
          })}
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
