import type { DashboardLayout } from "@emstack/types";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { LayoutNameDialog } from "@/components/dialogs/LayoutNameDialog";

interface LayoutManagerDialogsProps {
  renameTarget: DashboardLayout | null;
  isRenaming: boolean;
  closeRename: () => void;
  submitRename: (name: string) => void;
  saveAsTarget: DashboardLayout | null;
  isSavingPreset: boolean;
  closeSaveAs: () => void;
  submitSaveAs: (name: string) => void;
  deleteTarget: DashboardLayout | null;
  closeDelete: () => void;
  confirmDelete: () => void;
}

// The rename / save-as / delete dialog trio driven by
// useDashboardLayoutManager's dialog state. Purely presentational: each dialog
// opens when its manager target is set and routes submit/cancel back to the
// manager's handlers.
export function LayoutManagerDialogs({
  renameTarget,
  isRenaming,
  closeRename,
  submitRename,
  saveAsTarget,
  isSavingPreset,
  closeSaveAs,
  submitSaveAs,
  deleteTarget,
  closeDelete,
  confirmDelete,
}: LayoutManagerDialogsProps) {
  return (
    <>
      <LayoutNameDialog
        open={renameTarget !== null}
        title="Rename layout"
        initialName={renameTarget?.name ?? ""}
        isSaving={isRenaming}
        onOpenChange={(open) => {
          if (!open) closeRename();
        }}
        onSubmit={submitRename}
      />

      <LayoutNameDialog
        open={saveAsTarget !== null}
        title="Save as layout"
        submitLabel="Save"
        initialName={saveAsTarget?.name ?? ""}
        isSaving={isSavingPreset}
        onOpenChange={(open) => {
          if (!open) closeSaveAs();
        }}
        onSubmit={submitSaveAs}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete layout?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </>
  );
}
