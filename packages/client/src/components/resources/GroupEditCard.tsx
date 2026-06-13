import type { GroupDraft } from "./moduleDrafts";
import type { Tag, TagGroup, TaskResourceLevel } from "@emstack/types";

import { useState } from "react";

import { levelChipClass } from "./moduleDrafts";

import { EditFormActions } from "@/components/EditFormActions";
import { Input } from "@/components/input";
import { LevelAndTagsFields } from "@/components/resources/LevelAndTagsFields";
import { TagChip } from "@/components/tasks/TagChip";
import { Textarea } from "@/components/textarea";
import { Badge } from "@/components/ui/badge";

export function GroupMetaChips({
  easeOfStarting,
  timeNeeded,
  interactivity,
  tags,
}: {
  easeOfStarting: TaskResourceLevel | null;
  timeNeeded: TaskResourceLevel | null;
  interactivity: TaskResourceLevel | null;
  tags: Tag[];
}) {
  const hasAny
    = !!easeOfStarting || !!timeNeeded || !!interactivity || tags.length > 0;
  if (!hasAny) return null;
  function chip(label: string, level: TaskResourceLevel | null) {
    if (!level) return null;
    return (
      <Badge
        variant="outline"
        className={levelChipClass(level)}
      >
        {label}: {level}
      </Badge>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {chip("Ease", easeOfStarting)}
      {chip("Time", timeNeeded)}
      {chip("Interactivity", interactivity)}
      {tags.map(tag => (
        <TagChip
          key={tag.id}
          tag={tag.name}
        />
      ))}
    </div>
  );
}

export function GroupEditCard({
  draft: initial,
  hasEnumeratedModules,
  tagGroups,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: GroupDraft;
  hasEnumeratedModules: boolean;
  tagGroups: TagGroup[];
  isNew?: boolean;
  isSaving?: boolean;
  onSave: (d: GroupDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<GroupDraft>(initial);
  function update(patch: Partial<GroupDraft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Group Name
        </label>
        <Input
          type="text"
          value={draft.name}
          onChange={e =>
            update({
              name: e.target.value,
            })}
          required
          autoFocus
          placeholder="e.g. Section 1: Fundamentals"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Description (optional)
        </label>
        <Textarea
          value={draft.description}
          onChange={e =>
            update({
              description: e.target.value,
            })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Location (optional)
        </label>
        <Input
          type="text"
          value={draft.url}
          onChange={e =>
            update({
              url: e.target.value,
            })}
        />
      </div>
      {!hasEnumeratedModules && (
        <fieldset
          className="flex flex-col gap-2 rounded-md border border-border/60 p-2"
        >
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Direct counts (no enumerated modules)
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Completed
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.completedCount}
                onChange={e =>
                  update({
                    completedCount: e.target.value,
                  })}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Total
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.totalCount}
                onChange={e =>
                  update({
                    totalCount: e.target.value,
                  })}
                placeholder="0"
              />
            </div>
          </div>
        </fieldset>
      )}
      {hasEnumeratedModules && (
        <p className="text-xs text-muted-foreground">
          This group has enumerated modules; counts are derived from them.
          Remove all modules to switch to direct counts.
        </p>
      )}
      <LevelAndTagsFields
        draft={draft}
        tagGroups={tagGroups}
        onChange={update}
      />
      <EditFormActions
        isSaving={isSaving}
        onCancel={onCancel}
        onDelete={onDelete}
        isNew={isNew}
        removeLabel="Remove Group"
      />
    </form>
  );
}
