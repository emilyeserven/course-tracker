import type { ModuleAdminSectionProps } from "../-moduleAdminSectionProps";
import type { ModuleGroup } from "@emstack/types";

import { useState } from "react";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { GroupModuleList } from "./-GroupModuleList";
import {
  GroupHeaderControls,
  GroupMeta,
  GroupProgressHint,
  GroupStatusBadge,
  GroupTitle,
} from "./-GroupSectionParts";
import { useGroupSortable } from "./-useGroupSortable";

import {
  BulkNameAddCard,
  GroupEditCard,
  InteractionQuickLog,
  ModuleEditCard,
} from "@/components/resources/moduleAdminComponents";
import {
  emptyModuleDraft,
  groupToDraft,
} from "@/components/resources/moduleDrafts";
import { getGroupStatus } from "@/components/resources/moduleStatusMeta";

interface ModuleGroupSectionProps extends ModuleAdminSectionProps {
  group: ModuleGroup;
  groupIndex: number;
}

/**
 * One module group: header (collapse toggle, title, auto status icon, controls),
 * meta chips, optional quick-log + create-module cards, the enumerated module
 * list, and the fallback progress/empty hints. Clicking the header collapses the
 * body. Swaps to an inline `GroupEditCard` while this group is being edited.
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
    bulkCreateModulesMutation,
  } = api;
  const {
    editingGroupId,
    setEditingGroupId,
    creatingModuleIn,
    setCreatingModuleIn,
    bulkAddingInGroupId,
    setBulkAddingInGroupId,
    loggingForGroupId,
    setLoggingForGroupId,
  } = ui;

  const {
    setNodeRef, style, dragHandleProps,
  } = useGroupSortable(g.id);
  const [collapsed, setCollapsed] = useState(false);

  const groupModules = modulesByGroup.get(g.id) ?? [];
  const isCreatingHere = creatingModuleIn === g.id;
  const isBulkAddingHere = bulkAddingInGroupId === g.id;
  const groupStatus = getGroupStatus(g, groupModules);

  if (editingGroupId === g.id) {
    return (
      <GroupEditCard
        draft={groupToDraft(g)}
        hasEnumeratedModules={groupModules.length > 0}
        tagGroups={tagGroups}
        showPages={api.isBook}
        groupLabel={api.groupLabel}
        groupNamePlaceholder={api.groupHint}
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
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-md border bg-background p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex flex-1 cursor-pointer flex-col gap-0.5"
          onClick={() => setCollapsed(c => !c)}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(c => !c);
              }}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand group" : "Collapse group"}
              className="
                inline-flex size-5 shrink-0 items-center justify-center
                text-muted-foreground
              "
            >
              {collapsed
                ? (
                  <ChevronRightIcon className="size-4" />
                )
                : (
                  <ChevronDownIcon className="size-4" />
                )}
            </button>
            <GroupStatusBadge status={groupStatus} />
            <h3 className="font-medium">
              <GroupTitle group={g} />
            </h3>
          </div>
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
          dragHandleProps={dragHandleProps}
        />
      </div>
      {!collapsed && (
        <>
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
              showPages={api.isBook}
              moduleLabel={api.moduleLabel}
              moduleNamePlaceholder={api.moduleHint}
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
          {isBulkAddingHere && (
            <BulkNameAddCard
              itemLabel={api.moduleLabel}
              namePlaceholder={api.moduleHint}
              isSaving={bulkCreateModulesMutation.isPending}
              onSave={names =>
                bulkCreateModulesMutation.mutate(
                  {
                    names,
                    groupId: g.id,
                  },
                  {
                    onSuccess: () => setBulkAddingInGroupId(null),
                  },
                )}
              onCancel={() => setBulkAddingInGroupId(null)}
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
            isCreatingHere={isCreatingHere || isBulkAddingHere}
          />
        </>
      )}
    </div>
  );
}
