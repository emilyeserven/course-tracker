import { ModuleAdminHeader } from "./-ModuleAdminHeader";
import { ModuleGroupSection } from "./-ModuleGroupSection";
import { UngroupedModulesSection } from "./-UngroupedModulesSection";

import { GroupEditCard } from "@/components/resources/moduleAdminComponents";
import { emptyGroupDraft } from "@/components/resources/moduleDrafts";
import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";

interface Props {
  resourceId: string;
  modulesAreExhaustive?: boolean;
}

export function ResourceModulesAdmin({
  resourceId,
  modulesAreExhaustive,
}: Props) {
  const api = useResourceModules(resourceId);
  const ui = useModuleAdminUiState();

  const {
    tagGroups, groups, ungroupedModules, createGroupMutation,
  } = api;
  const {
    creatingGroup, setCreatingGroup, creatingModuleIn,
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
        modulesAreExhaustive={modulesAreExhaustive}
        api={api}
        ui={ui}
      />

      {creatingGroup && (
        <GroupEditCard
          draft={emptyGroupDraft()}
          hasEnumeratedModules={false}
          tagGroups={tagGroups}
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

      {isEmpty && (
        <p className="text-sm text-muted-foreground">
          No modules yet. Add a module directly, or create a module group to
          organize them.
        </p>
      )}
    </div>
  );
}
