import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";
import type { Module, ModuleGroup } from "@emstack/types";

import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import { ModuleListItem } from "./-ModuleListItem";

import {
  GroupEditCard,
  GroupMetaChips,
  InteractionQuickLog,
  ModuleEditCard,
} from "@/components/resources/moduleAdminComponents";
import {
  emptyModuleDraft,
  groupToDraft,
} from "@/components/resources/moduleDrafts";
import { Button } from "@/components/ui/button";
import { isHttpUrl } from "@/utils";

interface ModuleGroupSectionProps {
  group: ModuleGroup;
  groupIndex: number;
  resourceId: string;
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
}

/** The group title — a link when it carries an http(s) url, plain text otherwise. */
function GroupTitle({
  group: g,
}: { group: ModuleGroup }) {
  if (!g.url) return <>{g.name}</>;
  if (!isHttpUrl(g.url)) return <span title={g.url}>{g.name}</span>;
  return (
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
  );
}

/** Group meta chips, coalescing the group's optional level/tag fields. */
function GroupMeta({
  group: g,
}: { group: ModuleGroup }) {
  return (
    <GroupMetaChips
      easeOfStarting={g.easeOfStarting ?? null}
      timeNeeded={g.timeNeeded ?? null}
      interactivity={g.interactivity ?? null}
      tags={g.tags ?? []}
    />
  );
}

/** Reorder / add-module / log / edit controls in the group header. */
function GroupHeaderControls({
  group: g,
  groupIndex: gIndex,
  api,
  ui,
}: {
  group: ModuleGroup;
  groupIndex: number;
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
}) {
  const {
    groups, moveGroup, isReordering,
  } = api;
  const {
    isAnyEditing,
    setCreatingModuleIn,
    setLoggingForGroupId,
    setEditingGroupId,
  } = ui;

  return (
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
            isAnyEditing || isReordering || gIndex === groups.length - 1
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
  );
}

/** The enumerated module rows for a group; renders nothing when empty. */
function GroupModuleList({
  group: g,
  resourceId,
  groupModules,
  api,
  ui,
}: {
  group: ModuleGroup;
  resourceId: string;
  groupModules: Module[];
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
}) {
  if (groupModules.length === 0) return null;
  return (
    <ul className="flex flex-col divide-y rounded-sm border">
      {groupModules.map((m, mIndex) => (
        <ModuleListItem
          key={m.id}
          module={m}
          resourceId={resourceId}
          groupId={g.id}
          list={groupModules}
          index={mIndex}
          api={api}
          ui={ui}
        />
      ))}
    </ul>
  );
}

/**
 * Fallback shown when a group has no enumerated modules and none is being
 * created: either its direct progress counts or a hint to add modules.
 */
function GroupProgressHint({
  group: g,
  groupModules,
  isCreatingHere,
}: {
  group: ModuleGroup;
  groupModules: Module[];
  isCreatingHere: boolean;
}) {
  if (groupModules.length > 0 || isCreatingHere) return null;

  if (g.totalCount != null || g.completedCount != null) {
    return (
      <p className="text-xs text-muted-foreground">
        {g.completedCount ?? 0}
        {" / "}
        {g.totalCount ?? 0}
        {" complete"}
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      No modules in this group yet — add modules, or edit the group to track
      totals directly.
    </p>
  );
}

/**
 * One module group: header (title, controls), meta chips, optional quick-log +
 * create-module cards, the enumerated module list, and the fallback
 * progress/empty hints. Swaps to an inline `GroupEditCard` while this group is
 * being edited. Extracted from the `groups.map` body of `ResourceModulesAdmin`.
 */
export function ModuleGroupSection({
  group: g,
  groupIndex: gIndex,
  resourceId,
  api,
  ui,
}: ModuleGroupSectionProps) {
  const {
    tagGroups,
    modulesByGroup,
    upsertGroupMutation,
    deleteGroupMutation,
    createModuleMutation,
  } = api;
  const {
    editingGroupId,
    setEditingGroupId,
    creatingModuleIn,
    setCreatingModuleIn,
    loggingForGroupId,
    setLoggingForGroupId,
  } = ui;

  const groupModules = modulesByGroup.get(g.id) ?? [];
  const isCreatingHere = creatingModuleIn === g.id;

  if (editingGroupId === g.id) {
    return (
      <GroupEditCard
        draft={groupToDraft(g)}
        hasEnumeratedModules={groupModules.length > 0}
        tagGroups={tagGroups}
        isSaving={
          upsertGroupMutation.isPending || deleteGroupMutation.isPending
        }
        onSave={d =>
          upsertGroupMutation.mutate(d, {
            onSuccess: () => setEditingGroupId(null),
          })}
        onCancel={() => setEditingGroupId(null)}
        onDelete={() =>
          deleteGroupMutation.mutate(g.id, {
            onSuccess: () => setEditingGroupId(null),
          })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-medium">
            <GroupTitle group={g} />
          </h3>
          {g.description && (
            <span className="text-xs text-muted-foreground">
              {g.description}
            </span>
          )}
        </div>
        <GroupHeaderControls
          group={g}
          groupIndex={gIndex}
          api={api}
          ui={ui}
        />
      </div>
      <GroupMeta group={g} />
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
            createModuleMutation.mutate(
              {
                draft: d,
                groupId: g.id,
              },
              {
                onSuccess: () => setCreatingModuleIn(null),
              },
            )}
          onCancel={() => setCreatingModuleIn(null)}
        />
      )}
      <GroupModuleList
        group={g}
        resourceId={resourceId}
        groupModules={groupModules}
        api={api}
        ui={ui}
      />
      <GroupProgressHint
        group={g}
        groupModules={groupModules}
        isCreatingHere={isCreatingHere}
      />
    </div>
  );
}
