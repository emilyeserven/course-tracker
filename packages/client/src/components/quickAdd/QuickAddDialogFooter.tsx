import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface QuickAddDialogFooterProps {
  /** Label on the submit button, e.g. "Save", "Add", "Create". */
  submitLabel: string;
  /** Whether the create mutation is in flight (disables submit, shows a spinner). */
  isPending: boolean;
  /** Whether the form has enough input to submit. */
  canSubmit: boolean;
  /** Closes the dialog when Cancel is clicked. */
  onCancel: () => void;
}

/**
 * Shared Cancel/submit footer for the quick-add dialogs: an outline Cancel
 * button plus a submit button that shows a spinner while the mutation runs.
 */
export function QuickAddDialogFooter({
  submitLabel,
  isPending,
  canSubmit,
  onCancel,
}: QuickAddDialogFooterProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={!canSubmit || isPending}
      >
        {isPending && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </DialogFooter>
  );
}
