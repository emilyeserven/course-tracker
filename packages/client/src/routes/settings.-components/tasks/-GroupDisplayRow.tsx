import type { TagDraft } from "./-tagDrafts";
import type { TagGroup } from "@emstack/types";

import { PencilIcon, PlusIcon } from "lucide-react";

import { TagDisplayRow } from "./-TagDisplayRow";
import { makeEmptyTagDraft } from "./-tagDrafts";
import { TagEditRow } from "./-TagEditRow";

import { Button } from "@/components/ui/button";

interface GroupDisplayRowProps {
  group: TagGroup;
  isAnyEditing: boolean;
  onEdit: () => void;
  creatingTag: boolean;
  onStartCreateTag: () => void;
  onCancelCreateTag: () => void;
  onCreateTag: (draft: TagDraft) => void;
  isCreatingTag: boolean;
  editingTagId: string | null;
  onStartEditTag: (tagId: string) => void;
  onCancelEditTag: () => void;
  onUpsertTag: (draft: TagDraft) => void;
  onDeleteTag: (tagId: string) => void;
  isTagBusy: boolean;
}

export function GroupDisplayRow({
  group,
  isAnyEditing,
  onEdit,
  creatingTag,
  onStartCreateTag,
  onCancelCreateTag,
  onCreateTag,
  isCreatingTag,
  editingTagId,
  onStartEditTag,
  onCancelEditTag,
  onUpsertTag,
  onDeleteTag,
  isTagBusy,
}: GroupDisplayRowProps) {
  const tags = group.tags ?? [];
  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{group.name}</span>
          {group.description && (
            <span className="text-xs text-muted-foreground">
              {group.description}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={isAnyEditing}
          >
            <PencilIcon className="size-4" />
            Edit Group
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onStartCreateTag}
            disabled={isAnyEditing}
          >
            <PlusIcon className="size-4" />
            Add Tag
          </Button>
        </div>
      </div>
      <ul className="flex flex-col divide-y rounded-sm border bg-background">
        {creatingTag && (
          <TagEditRow
            draft={makeEmptyTagDraft(group.id)}
            isNew
            isSaving={isCreatingTag}
            onSave={onCreateTag}
            onCancel={onCancelCreateTag}
          />
        )}
        {tags.length === 0 && !creatingTag && (
          <li className="px-2 py-1.5 text-xs text-muted-foreground">
            No tags in this group.
          </li>
        )}
        {tags.map((tag) => {
          if (tag.id === editingTagId) {
            return (
              <TagEditRow
                key={tag.id}
                draft={{
                  id: tag.id,
                  groupId: tag.groupId,
                  name: tag.name,
                  color: tag.color ?? "",
                }}
                isSaving={isTagBusy}
                onSave={onUpsertTag}
                onCancel={onCancelEditTag}
                onDelete={() => onDeleteTag(tag.id)}
              />
            );
          }
          return (
            <TagDisplayRow
              key={tag.id}
              tag={tag}
              isAnyEditing={isAnyEditing}
              onEdit={() => onStartEditTag(tag.id)}
            />
          );
        })}
      </ul>
    </li>
  );
}
