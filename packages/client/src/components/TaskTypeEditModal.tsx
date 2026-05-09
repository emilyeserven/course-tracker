import type { TaskType } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { Input } from "@/components/input";
import { TagsInput } from "@/components/tasks/TagsInput";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskTypeEditModalProps {
  open: boolean;
  taskType: TaskType | null;
  isNew?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (next: TaskType) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

export function TaskTypeEditModal({
  open,
  taskType,
  isNew = false,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
  deleteDisabled = false,
  deleteDisabledReason,
}: TaskTypeEditModalProps) {
  const [draft, setDraft] = useState<TaskType | null>(taskType);

  useEffect(() => {
    setDraft(taskType);
  }, [taskType]);

  if (!draft) {
    return null;
  }

  function update(patch: Partial<TaskType>) {
    setDraft((prev: TaskType | null) => (prev
      ? {
        ...prev,
        ...patch,
      }
      : prev));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    onSave(draft);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add Task Type" : "Edit Task Type"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="task-type-name"
            >
              Name
            </label>
            <Input
              id="task-type-name"
              type="text"
              value={draft.name}
              onChange={e => update({
                name: e.target.value,
              })}
              required
              placeholder="Task type name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="task-type-when-to-use"
            >
              When to Use
            </label>
            <Textarea
              id="task-type-when-to-use"
              value={draft.whenToUse ?? ""}
              onChange={e => update({
                whenToUse: e.target.value,
              })}
              placeholder="Describe when this type of task fits best"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Tags
            </label>
            <TagsInput
              value={draft.tags ?? []}
              onChange={tags => update({
                tags,
              })}
              placeholder="e.g. skill:listening"
              groupByPrefix
            />
            <p className="text-xs text-muted-foreground">
              Use a
              {" "}
              <code className="rounded-sm bg-muted px-1">group:value</code>
              {" "}
              format (e.g.
              {" "}
              <code className="rounded-sm bg-muted px-1">skill:listening</code>
              ) to group tags in the dropdown.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            {onDelete && !isNew
              ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isSaving || deleteDisabled}
                  title={deleteDisabled ? deleteDisabledReason : undefined}
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
                onClick={() => onOpenChange(false)}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
