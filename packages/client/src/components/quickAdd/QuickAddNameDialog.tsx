import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickAddNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading, e.g. "Add Resource". */
  title: string;
  /** Slug for the input's id, e.g. "resource" → `quick-add-resource-name`. */
  entity: string;
  /** Placeholder shown in the name input. */
  placeholder: string;
  /** Seeds the name input each time the dialog opens. */
  initialName?: string;
  /** Whether the create mutation is in flight (disables submit, shows a spinner). */
  isPending: boolean;
  /** Called with the trimmed, non-empty name when the form is submitted. */
  onSubmit: (name: string) => void;
}

/**
 * Presentational shell for the single-name quick-add dialogs (Resource, Task):
 * a name field plus Cancel/Create footer. It owns the input state and open-reset
 * effect; callers own the create mutation and pass `isPending` + `onSubmit`.
 */
export function QuickAddNameDialog({
  open,
  onOpenChange,
  title,
  entity,
  placeholder,
  initialName,
  isPending,
  onSubmit,
}: QuickAddNameDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(initialName ?? "");
  }, [open, initialName]);

  const trimmed = name.trim();
  const inputId = `quick-add-${entity}-name`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) onSubmit(trimmed);
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <Input
              id={inputId}
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={placeholder}
              maxLength={255}
            />
          </div>
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
              disabled={!trimmed || isPending}
            >
              {isPending && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
