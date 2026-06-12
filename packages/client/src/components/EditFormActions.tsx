import { Loader2, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditFormActionsProps {
  isSaving: boolean;
  onCancel: () => void;
  onDelete?: () => void;
  isNew?: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  /** Size applied to the Save and Cancel buttons (the Remove button is always `sm`). */
  size?: "default" | "sm";
  /** Label for the destructive remove button. */
  removeLabel?: string;
  /** Tailwind size class for the trash icon (default `size-4`). */
  trashIconClassName?: string;
}

/**
 * Standard Save / Cancel / Remove actions row shared by the inline entity
 * edit forms (tag groups, tags, task types, modules, module groups,
 * interaction logs, task-resource rows).
 */
export function EditFormActions({
  isSaving,
  onCancel,
  onDelete,
  isNew = false,
  deleteDisabled,
  deleteDisabledReason,
  size,
  removeLabel = "Remove",
  trashIconClassName = "size-4",
}: EditFormActionsProps) {
  return (
    <div
      className="flex flex-row flex-wrap items-center justify-between gap-2"
    >
      <div className="flex flex-row gap-2">
        <Button
          size={size}
          type="submit"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save
        </Button>
        <Button
          size={size}
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
      {onDelete && !isNew && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isSaving || deleteDisabled}
          title={deleteDisabled ? deleteDisabledReason : undefined}
        >
          <Trash2Icon className={trashIconClassName} />
          {removeLabel}
        </Button>
      )}
    </div>
  );
}
