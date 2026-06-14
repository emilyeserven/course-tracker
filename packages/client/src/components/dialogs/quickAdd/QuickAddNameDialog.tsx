import { useEffect, useState } from "react";

import { QuickAddDialogFooter } from "./QuickAddDialogFooter";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NAME_MAX_LENGTH } from "@/constants/stringLimits";

interface QuickAddNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading, e.g. "Add Resource". */
  title: string;
  /** Slug for the input's id, e.g. "resource" → `quick-add-resource-name`. */
  entity: string;
  /**
   * Accessible description for the dialog. Defaults to a sentence derived from
   * `entity` (e.g. "Enter a name to create a new resource.").
   */
  description?: React.ReactNode;
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
  description,
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
          <DialogDescription>
            {description ?? `Enter a name to create a new ${entity}.`}
          </DialogDescription>
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
              maxLength={NAME_MAX_LENGTH}
            />
          </div>
          <QuickAddDialogFooter
            submitLabel="Create"
            isPending={isPending}
            canSubmit={Boolean(trimmed)}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
