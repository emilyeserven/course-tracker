import type { ControlledDialogProps } from "@/types/dialogProps";

import { useEffect, useState } from "react";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LayoutNameDialogProps extends ControlledDialogProps {
  title: string;
  /** Prefilled name when renaming; empty for a new layout. */
  initialName?: string;
  submitLabel?: string;
  isSaving?: boolean;
  onSubmit: (name: string) => void;
}

/**
 * Minimal name prompt shared by the dashboard's "add layout" button and the
 * Settings rename action.
 */
export function LayoutNameDialog({
  open,
  title,
  initialName = "",
  submitLabel = "Save",
  isSaving = false,
  onOpenChange,
  onSubmit,
}: LayoutNameDialogProps) {
  const [name, setName] = useState(initialName);

  // Reset the field whenever the dialog (re)opens for a different target.
  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const trimmed = name.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Enter a name for this layout.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) onSubmit(trimmed);
          }}
        >
          <Input
            autoFocus
            value={name}
            placeholder="Layout name"
            onChange={e => setName(e.target.value)}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmed || isSaving}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
