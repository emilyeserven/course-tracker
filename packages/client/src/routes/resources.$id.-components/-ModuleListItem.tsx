import type { ModuleAdminSectionProps } from "./-moduleAdminSectionProps";
import type { Module } from "@emstack/types";

import { Fragment } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  hasModuleDetails,
  InteractionQuickLog,
  ModuleDetailsPanel,
  ModuleDisplayRow,
  ModuleEditCard,
} from "@/components/resources/moduleAdminComponents";
import { moduleToDraft } from "@/components/resources/moduleDrafts";

interface ModuleListItemProps extends ModuleAdminSectionProps {
  module: Module;
  /** Owning group id, or null for an ungrouped module. */
  groupId: string | null;
  /** The sibling list this module belongs to, for reorder bounds/moves. */
  list: Module[];
  index: number;
}

/**
 * A single module within a list (grouped or ungrouped): renders the inline edit
 * card when it's the one being edited, otherwise the display row plus an
 * optional quick-log panel. Shared by `UngroupedModulesSection` and
 * `ModuleGroupSection` so the two lists stay in lockstep.
 */
export function ModuleListItem({
  module: m,
  resourceId,
  groupId,
  list,
  index,
  api,
  ui,
}: ModuleListItemProps) {
  const {
    tagGroups,
    upsertModuleMutation,
    deleteModuleMutation,
    setStatusMutation,
    moveModule,
    isReordering,
  } = api;
  const {
    editingModuleId,
    setEditingModuleId,
    loggingForModuleId,
    setLoggingForModuleId,
    expandedModuleId,
    setExpandedModuleId,
    isAnyEditing,
    reorderMode,
  } = ui;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: m.id,
  });
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const expandable = hasModuleDetails(m);

  if (m.id === editingModuleId) {
    return (
      <ModuleEditCard
        draft={moduleToDraft(m)}
        tagGroups={tagGroups}
        showPages={api.isBook}
        moduleLabel={api.moduleLabel}
        moduleNamePlaceholder={api.moduleHint}
        isSaving={
          upsertModuleMutation.isPending || deleteModuleMutation.isPending
        }
        onSave={d =>
          upsertModuleMutation.mutate(
            {
              draft: d,
              groupId,
              status: m.status,
            },
            {
              onSuccess: () => setEditingModuleId(null),
            },
          )}
        onCancel={() => setEditingModuleId(null)}
        onDelete={() =>
          deleteModuleMutation.mutate(m.id, {
            onSuccess: () => setEditingModuleId(null),
          })}
      />
    );
  }

  return (
    <Fragment>
      <ModuleDisplayRow
        module={m}
        isAnyEditing={isAnyEditing}
        isReordering={isReordering}
        canMoveUp={index > 0}
        canMoveDown={index < list.length - 1}
        onMoveUp={() => moveModule(list, index, "up")}
        onMoveDown={() => moveModule(list, index, "down")}
        onSetStatus={status => setStatusMutation.mutate({
          module: m,
          status,
        })}
        onOpenDetails={() =>
          setExpandedModuleId(expandedModuleId === m.id ? null : m.id)}
        onEdit={() => setEditingModuleId(m.id)}
        onLogInteraction={() => setLoggingForModuleId(m.id)}
        isStatusPending={setStatusMutation.isPending}
        reorderMode={reorderMode}
        expandable={expandable}
        setNodeRef={setNodeRef}
        dragStyle={dragStyle}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
      {expandable && expandedModuleId === m.id && (
        <ModuleDetailsPanel
          module={m}
          onEdit={() => {
            setExpandedModuleId(null);
            setEditingModuleId(m.id);
          }}
        />
      )}
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
  );
}
