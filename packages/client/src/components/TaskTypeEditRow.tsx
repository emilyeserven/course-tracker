import type { TaskType } from "@emstack/types/src";

import { useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { Input } from "@/components/input";
import { TagsInput } from "@/components/tasks/TagsInput";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";

interface TaskTypeEditRowProps {
  taskType: TaskType;
  isNew?: boolean;
  isSaving?: boolean;
  onSave: (next: TaskType) => void;
  onCancel: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

export function TaskTypeEditRow({
  taskType,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
  deleteDisabled = false,
  deleteDisabledReason,
}: TaskTypeEditRowProps) {
  const [draft, setDraft] = useState<TaskType>(taskType);

  function update(patch: Partial<TaskType>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draft);
  }

  return (
    <li className="bg-muted/30 p-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
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
            autoFocus
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
        <div
          className="flex flex-row flex-wrap items-center justify-between gap-2"
        >
          <div className="flex flex-row gap-2">
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="animate-spin" />}
              Save
            </Button>
            <Button
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
              <Trash2Icon className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </form>
    </li>
  );
}
