import type { GroupDraft } from "./moduleDrafts";
import type { Tag, TagGroup, TaskResourceLevel } from "@emstack/types";

import { useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { LevelTriad } from "./LevelTriad";
import { levelChipClass, lookupTagsByIds } from "./moduleDrafts";

import { Input } from "@/components/input";
import { TagChip } from "@/components/tasks/TagChip";
import { TagPicker } from "@/components/tasks/TagPicker";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";

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
      <span
        className={`
          inline-flex items-center rounded-full border px-2 py-0.5 text-xs
          font-medium
          ${levelChipClass(level)}
        `}
      >
        {label}: {level}
      </span>
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
      <LevelTriad
        easeOfStarting={draft.easeOfStarting}
        timeNeeded={draft.timeNeeded}
        interactivity={draft.interactivity}
        onChange={patch => update(patch)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <TagPicker
          value={draft.tagIds}
          onChange={ids =>
            update({
              tagIds: lookupTagsByIds(ids, tagGroups).map(t => t.id),
            })}
          tagGroups={tagGroups}
          placeholder={
            tagGroups.length > 0
              ? "Pick tags..."
              : "No tags configured. Add some on the Settings page."
          }
        />
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
            disabled={isSaving}
          >
            <Trash2Icon className="size-4" />
            Remove Group
          </Button>
        )}
      </div>
    </form>
  );
}
