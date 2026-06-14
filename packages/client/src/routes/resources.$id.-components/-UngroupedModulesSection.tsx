import type { ModuleAdminSectionProps } from "./-moduleAdminSectionProps";

import { ModuleListItem } from "./-ModuleListItem";

import { ModuleEditCard } from "@/components/resources/moduleAdminComponents";
import { emptyModuleDraft } from "@/components/resources/moduleDrafts";
import { UNGROUPED_KEY } from "@/hooks/useModuleAdminUiState";

type UngroupedModulesSectionProps = ModuleAdminSectionProps;

/**
 * The top-level "Ungrouped" block: an optional inline create card plus the list
 * of ungrouped modules. Renders nothing when there are no ungrouped modules and
 * none is being created.
 */
export function UngroupedModulesSection({
  resourceId,
  api,
  ui,
}: UngroupedModulesSectionProps) {
  const {
    tagGroups, ungroupedModules, createModuleMutation,
  } = api;
  const {
    creatingModuleIn, setCreatingModuleIn,
  } = ui;

  const isCreatingHere = creatingModuleIn === UNGROUPED_KEY;

  if (!isCreatingHere && ungroupedModules.length === 0) return null;

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
    </div>
  );
}
