import type { TagDraft } from "./-tagDrafts";
import type { EditRowBaseProps } from "@/types/editRowProps";

import { useState } from "react";

import { EditFormActions } from "@/components/layout/EditFormActions";
import { Input } from "@/components/ui/input";

interface TagEditRowProps extends EditRowBaseProps {
  draft: TagDraft;
  onSave: (draft: TagDraft) => void;
}

export function TagEditRow({
  draft: initial,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: TagEditRowProps) {
  const [draft, setDraft] = useState<TagDraft>(initial);

  function update(patch: Partial<TagDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  return (
    <li className="bg-muted/40 p-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-name"
          >
            Tag Name
          </label>
          <Input
            id="tag-name"
            type="text"
            value={draft.name}
            onChange={e =>
              update({
                name: e.target.value,
              })}
            required
            placeholder="e.g. skills:listening"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-color"
          >
            Color
            {" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="tag-color"
            type="text"
            value={draft.color}
            onChange={e =>
              update({
                color: e.target.value,
              })}
            placeholder="e.g. blue, #34d"
          />
        </div>
        <EditFormActions
          isSaving={isSaving}
          onCancel={onCancel}
          onDelete={onDelete}
          isNew={isNew}
          size="sm"
          trashIconClassName="size-3.5"
        />
      </form>
    </li>
  );
}
