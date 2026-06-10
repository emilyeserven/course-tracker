import type { DailyFormProps } from "./DailyForm";

import { useRef, useState } from "react";

import { ConfirmDialog } from "../ConfirmDialog";
import { DailyForm } from "./DailyForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyEditDialogProps
  extends Omit<DailyFormProps, "hideUnsavedBlocker" | "hasChangesRef"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function DailyEditDialog({
  open,
  onOpenChange,
  title,
  onSaved,
  onCancel,
  onDeleted,
  onDuplicated,
  isNew,
  ...formProps
}: DailyEditDialogProps) {
  const hasChangesRef = useRef(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const closeRequested = () => {
    if (hasChangesRef.current) {
      setConfirmCloseOpen(true);
    }
    else {
      onOpenChange(false);
    }
  };

  const resolvedTitle = title ?? (isNew ? "New Daily" : "Edit Daily");

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            closeRequested();
          }
          else {
            onOpenChange(true);
          }
        }}
      >
        <DialogContent
          onEscapeKeyDown={(e) => {
            if (hasChangesRef.current) {
              e.preventDefault();
              setConfirmCloseOpen(true);
            }
          }}
          onPointerDownOutside={(e) => {
            if (hasChangesRef.current) {
              e.preventDefault();
              setConfirmCloseOpen(true);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{resolvedTitle}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-1">
            <DailyForm
              {...formProps}
              isNew={isNew}
              hideUnsavedBlocker
              hasChangesRef={hasChangesRef}
              onSaved={async (result) => {
                hasChangesRef.current = false;
                await onSaved?.(result);
                onOpenChange(false);
              }}
              onCancel={async () => {
                if (onCancel) {
                  await onCancel();
                }
                closeRequested();
              }}
              onDeleted={async () => {
                hasChangesRef.current = false;
                await onDeleted?.();
                onOpenChange(false);
              }}
              onDuplicated={async (newId) => {
                hasChangesRef.current = false;
                await onDuplicated?.(newId);
                onOpenChange(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmCloseOpen}
        title="Discard unsaved changes?"
        description="You have unsaved changes that will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          hasChangesRef.current = false;
          setConfirmCloseOpen(false);
          onOpenChange(false);
        }}
        onCancel={() => setConfirmCloseOpen(false)}
      />
    </>
  );
}
