import type { ModuleAdminSectionProps } from "./-moduleAdminSectionProps";

import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ModuleListItem } from "./-ModuleListItem";
import {
  handleListDragEnd,
  reorderCollisionDetection,
  reorderModifiers,
  useReorderSensors,
} from "./-reorderDnd";

import { ModuleEditCard } from "@/components/resources/moduleAdminComponents";
import { emptyModuleDraft } from "@/components/resources/moduleDrafts";
import { UNGROUPED_KEY } from "@/hooks/useModuleAdminUiState";

type UngroupedModulesSectionProps = ModuleAdminSectionProps;

/**
 * The top-level "Ungrouped" block: an optional inline create card plus the list
 * of ungrouped modules. Renders nothing when there are no ungrouped modules and
 * none is being created. In reorder mode the list becomes a sortable scope so
 * ungrouped modules can be dragged among themselves.
 */
export function UngroupedModulesSection({
  resourceId,
  api,
  ui,
}: UngroupedModulesSectionProps) {
  const {
    tagGroups, ungroupedModules, createModuleMutation, reorderModulesList,
  } = api;
  const {
    creatingModuleIn, setCreatingModuleIn, reorderMode,
  } = ui;
  const sensors = useReorderSensors();

  const isCreatingHere = creatingModuleIn === UNGROUPED_KEY;

  if (!isCreatingHere && ungroupedModules.length === 0) return null;

  const list = (
    <ul className="flex flex-col divide-y rounded-sm border">
      {ungroupedModules.map((m, index) => (
        <ModuleListItem
          key={m.id}
          module={m}
          resourceId={resourceId}
          groupId={null}
          list={ungroupedModules}
          index={index}
          api={api}
          ui={ui}
        />
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
      <h3 className="text-sm font-medium text-muted-foreground">Ungrouped</h3>
      {isCreatingHere && (
        <ModuleEditCard
          draft={emptyModuleDraft()}
          tagGroups={tagGroups}
          isNew
          showPages={api.isBook}
          moduleLabel={api.moduleLabel}
          isSaving={createModuleMutation.isPending}
          onSave={d =>
            createModuleMutation.mutate(
              {
                draft: d,
                groupId: null,
              },
              {
                onSuccess: () => setCreatingModuleIn(null),
              },
            )}
          onCancel={() => setCreatingModuleIn(null)}
        />
      )}
      {reorderMode
        ? (
          <DndContext
            sensors={sensors}
            collisionDetection={reorderCollisionDetection}
            modifiers={reorderModifiers}
            onDragEnd={e =>
              handleListDragEnd(e, ungroupedModules, reorderModulesList)}
          >
            <SortableContext
              items={ungroupedModules.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {list}
            </SortableContext>
          </DndContext>
        )
        : (
          list
        )}
    </div>
  );
}
