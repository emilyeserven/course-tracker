import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ModuleAdminHeader } from "./-ModuleAdminHeader";
import { ModuleGroupSection } from "./-ModuleGroupSection";
import {
  handleListDragEnd,
  reorderCollisionDetection,
  reorderModifiers,
  useReorderSensors,
} from "./-reorderDnd";
import { UngroupedModulesSection } from "./-UngroupedModulesSection";

import { GroupEditCard } from "@/components/resources/moduleAdminComponents";
import { emptyGroupDraft } from "@/components/resources/moduleDrafts";
import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";

interface Props {
  resourceId: string;
  /** When true, show the editable "module list is exhaustive" toggle. */
  canEditExhaustive?: boolean;
}

export function ResourceModulesAdmin({
  resourceId,
  canEditExhaustive,
}: Props) {
  const api = useResourceModules(resourceId);
  const ui = useModuleAdminUiState();
  const sensors = useReorderSensors();

  const {
    tagGroups,
    groups,
    ungroupedModules,
    createGroupMutation,
    reorderGroupsList,
    isBook,
    groupLabel,
    moduleLabel,
  } = api;
  const {
    creatingGroup, setCreatingGroup, creatingModuleIn, reorderMode,
  } = ui;

  const isEmpty
    = groups.length === 0
      && ungroupedModules.length === 0
      && !creatingGroup
      && creatingModuleIn === null;

  return (
    <div className="flex flex-col gap-4">
      <ModuleAdminHeader
        resourceId={resourceId}
        canEditExhaustive={canEditExhaustive}
        api={api}
        ui={ui}
      />

      {creatingGroup && (
        <GroupEditCard
          draft={emptyGroupDraft()}
          hasEnumeratedModules={false}
          tagGroups={tagGroups}
          showPages={isBook}
          groupLabel={groupLabel}
          isNew
          isSaving={createGroupMutation.isPending}
          onSave={d =>
            createGroupMutation.mutate(d, {
              onSuccess: () => setCreatingGroup(false),
            })}
          onCancel={() => setCreatingGroup(false)}
        />
      )}

      <UngroupedModulesSection
        resourceId={resourceId}
        api={api}
        ui={ui}
      />

      {reorderMode
        ? (
          <DndContext
            sensors={sensors}
            collisionDetection={reorderCollisionDetection}
            modifiers={reorderModifiers}
            onDragEnd={e => handleListDragEnd(e, groups, reorderGroupsList)}
          >
            <SortableContext
              items={groups.map(g => g.id)}
              strategy={verticalListSortingStrategy}
            >
              {groups.map((g, gIndex) => (
                <ModuleGroupSection
                  key={g.id}
                  group={g}
                  groupIndex={gIndex}
                  resourceId={resourceId}
                  api={api}
                  ui={ui}
                />
              ))}
            </SortableContext>
          </DndContext>
        )
        : (
          groups.map((g, gIndex) => (
            <ModuleGroupSection
              key={g.id}
              group={g}
              groupIndex={gIndex}
              resourceId={resourceId}
              api={api}
              ui={ui}
            />
          ))
        )}

      {isEmpty && (
        <p className="text-sm text-muted-foreground">
          No {moduleLabel.toLowerCase()}s yet. Add a
          {" "}
          {moduleLabel.toLowerCase()}
          {" "}
          directly, or create a
          {" "}
          {groupLabel.toLowerCase()}
          {" "}
          to organize them.
        </p>
      )}
    </div>
  );
}
