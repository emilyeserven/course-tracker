import type { ReactNode } from "react";

import { CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/DeleteButton";

interface EditPageFooterProps {
  isNew: boolean;
  onDelete?: () => void | Promise<void>;
  deleteLabel?: string;
  onDuplicate?: () => void | Promise<void>;
  duplicateLabel?: string;
  children: ReactNode;
}

export function EditPageFooter({
  isNew,
  onDelete,
  deleteLabel,
  onDuplicate,
  duplicateLabel,
  children,
}: EditPageFooterProps) {
  const showDestructive = !isNew && (onDelete || onDuplicate);

  return (
    <div
      className={`
        mt-4 flex flex-col gap-3 rounded-md border bg-card p-4
        sm:flex-row sm:items-center sm:justify-between
      `}
    >
      <div className="flex flex-row gap-2">{children}</div>
      {showDestructive && (
        <div
          className="
            flex flex-row gap-2
            sm:justify-end
          "
        >
          {onDuplicate && (
            <Button
              type="button"
              variant="secondary"
              onClick={onDuplicate}
            >
              {duplicateLabel ?? "Duplicate"}
              {" "}
              <CopyIcon />
            </Button>
          )}
          {onDelete && (
            <DeleteButton onClick={onDelete}>
              {deleteLabel ?? "Delete"}
            </DeleteButton>
          )}
        </div>
      )}
    </div>
  );
}
