import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";
import type { Module } from "@emstack/types";

import { Fragment } from "react";

import {
  InteractionQuickLog,
  ModuleDisplayRow,
  ModuleEditCard,
} from "@/components/resources/moduleAdminComponents";
import { moduleToDraft } from "@/components/resources/moduleDrafts";

interface ModuleListItemProps {
  module: Module;
  resourceId: string;
  /** Owning group id, or null for an ungrouped module. */
  groupId: string | null;
  /** The sibling list this module belongs to, for reorder bounds/moves. */
  list: Module[];
  index: number;
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
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
    toggleCompleteMutation,
    moveModule,
    isReordering,
  } = api;
  const {
    editingModuleId,
    setEditingModuleId,
    loggingForModuleId,
    setLoggingForModuleId,
    isAnyEditing,
  } = ui;

  if (m.id === editingModuleId) {
    return (
      <ModuleEditCard
        draft={moduleToDraft(m)}
        tagGroups={tagGroups}
        isComplete={m.isComplete}
        isSaving={
          upsertModuleMutation.isPending || deleteModuleMutation.isPending
        }
        onSave={d =>
          upsertModuleMutation.mutate(
            {
              draft: d,
              groupId,
              isComplete: m.isComplete,
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
  );
}
