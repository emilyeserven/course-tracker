import { ModuleGroupList, UngroupedModulesSection } from "../grouping";
import { ModuleAdminHeader } from "../header";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import {
  BulkNameAddCard,
  GroupEditCard,
  ModuleBulkEditTable,
} from "@/components/resources/moduleAdminComponents";
import { emptyGroupDraft } from "@/components/resources/moduleDrafts";
import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useModuleBulkEdit } from "@/hooks/useModuleBulkEdit";
import { useResourceModules } from "@/hooks/useResourceModules";

interface Props {
  resourceId: string;
  /** When true, show the editable "module list is exhaustive" toggle. */
  canEditExhaustive?: boolean;
}

export function ResourceModulesAdmin({
  resourceId, canEditExhaustive,
}: Props) {
  const api = useResourceModules(resourceId);
  const ui = useModuleAdminUiState();
  const bulk = useModuleBulkEdit(api, ui);

  const {
    tagGroups,
    groups,
    ungroupedModules,
    createGroupMutation,
    bulkCreateGroupsMutation,
    isBook,
    groupLabel,
    moduleLabel,
    groupHint,
  } = api;
  const {
    creatingGroup,
    setCreatingGroup,
    bulkAddingGroups,
    setBulkAddingGroups,
    creatingModuleIn,
    bulkEditMode,
  } = ui;

  const isEmpty
    = groups.length === 0
      && ungroupedModules.length === 0
      && !creatingGroup
      && !bulkAddingGroups
      && creatingModuleIn === null;

  return (
    <div className="flex flex-col gap-4">
      <ModuleAdminHeader
        resourceId={resourceId}
        canEditExhaustive={canEditExhaustive}
        onToggleBulkEdit={bulk.toggle}
        api={api}
        ui={ui}
      />

      {bulkEditMode
        ? (
          <ModuleBulkEditTable
            modules={bulk.modules}
            groups={groups}
            tagGroups={tagGroups}
            isBook={isBook}
            editor={bulk.editor}
            isSaving={bulk.isSaving}
            onSaveAll={bulk.saveAll}
          />
        )
        : (
          <>
            {creatingGroup && (
              <GroupEditCard
                draft={emptyGroupDraft()}
                hasEnumeratedModules={false}
                tagGroups={tagGroups}
                showPages={isBook}
                groupLabel={groupLabel}
                groupNamePlaceholder={groupHint}
                isNew
                isSaving={createGroupMutation.isPending}
                onSave={d =>
                  createGroupMutation.mutate(d, {
                    onSuccess: () => setCreatingGroup(false),
                  })}
                onCancel={() => setCreatingGroup(false)}
              />
            )}

            {bulkAddingGroups && (
              <BulkNameAddCard
                itemLabel={groupLabel}
                namePlaceholder={groupHint}
                isSaving={bulkCreateGroupsMutation.isPending}
                onSave={names =>
                  bulkCreateGroupsMutation.mutate(names, {
                    onSuccess: () => setBulkAddingGroups(false),
                  })}
                onCancel={() => setBulkAddingGroups(false)}
              />
            )}

            <UngroupedModulesSection
              resourceId={resourceId}
              api={api}
              ui={ui}
            />

            <ModuleGroupList
              resourceId={resourceId}
              api={api}
              ui={ui}
            />

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
          </>
        )}

      <ConfirmDialog
        open={bulk.confirmExitOpen}
        title="Discard unsaved edits?"
        description="You have unsaved changes in the bulk editor. Leaving will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={bulk.confirmExit}
        onCancel={bulk.cancelExit}
      />
    </div>
  );
}
