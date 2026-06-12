import { Loader2, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface EditModalFooterProps {
  isNew?: boolean;
  isSaving?: boolean;
  deleteDisabled?: boolean;
  onDelete?: () => void;
  onCancel: () => void;
}

/**
 * Standard footer (Remove / Cancel / Save) for entity edit dialogs.
 * Shared by the routine and daily-criteria template edit modals.
 */
export function EditModalFooter({
  isNew,
  isSaving,
  deleteDisabled,
  onDelete,
  onCancel,
}: EditModalFooterProps) {
  return (
    <DialogFooter className="sm:justify-between">
      {onDelete && !isNew
        ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isSaving || deleteDisabled}
          >
            <Trash2Icon className="size-4" />
            Remove
          </Button>
        )
        : (
          <span />
        )}
      <div
        className="
          flex flex-col-reverse gap-2
          sm:flex-row
        "
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save
        </Button>
      </div>
    </DialogFooter>
  );
}
