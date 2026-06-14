import type { TagGroupDraft } from "./-tagDrafts";
import type { EditRowBaseProps } from "@/types/editRowProps";

import { useState } from "react";

import { EditFormActions } from "@/components/layout/EditFormActions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GroupEditRowProps extends EditRowBaseProps {
  draft: TagGroupDraft;
  onSave: (draft: TagGroupDraft) => void;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

export function GroupEditRow({
  draft: initial,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
  deleteDisabled = false,
  deleteDisabledReason,
}: GroupEditRowProps) {
  const [draft, setDraft] = useState<TagGroupDraft>(initial);

  function update(patch: Partial<TagGroupDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  return (
    <li className="bg-muted/30 p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-group-name"
          >
            Name
          </label>
          <Input
            id="tag-group-name"
            type="text"
            value={draft.name}
            onChange={e =>
              update({
                name: e.target.value,
              })}
            required
            placeholder="e.g. skills, format"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-group-description"
          >
            Description
          </label>
          <Textarea
            id="tag-group-description"
            value={draft.description}
            onChange={e =>
              update({
                description: e.target.value,
              })}
            placeholder="What this group is for"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-group-color"
          >
            Color
            {" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="tag-group-color"
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
          deleteDisabled={deleteDisabled}
          deleteDisabledReason={deleteDisabledReason}
        />
      </form>
    </li>
  );
}
