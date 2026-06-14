import type { EditRowBaseProps } from "@/types/editRowProps";
import type { TaskType } from "@emstack/types";

import { useState } from "react";

import { EditFormActions } from "@/components/layout/EditFormActions";
import { TagsInput } from "@/components/tasks/TagsInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskTypeEditRowProps extends EditRowBaseProps {
  taskType: TaskType;
  onSave: (next: TaskType) => void;
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
        <EditFormActions
          isSaving={isSaving}
          onCancel={onCancel}
          onDelete={onDelete}
          isNew={isNew}
          deleteDisabled={deleteDisabled}
          deleteDisabledReason={deleteDisabledReason}
        />
      </form>
    </li>
  );
}
