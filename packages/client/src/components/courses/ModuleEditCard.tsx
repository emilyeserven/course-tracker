import type { ModuleDraft } from "./moduleDrafts";
import type { ModuleDurationBucket, TagGroup } from "@emstack/types";

import { useState } from "react";

import {
  MODULE_DURATION_BUCKETS,
  MODULE_DURATION_LABELS,
} from "@emstack/types";
import { Loader2, Trash2Icon } from "lucide-react";

import { LevelTriad } from "./LevelTriad";
import { lookupTagsByIds } from "./moduleDrafts";

import { Input } from "@/components/input";
import { TagPicker } from "@/components/tasks/TagPicker";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";

export function ModuleEditCard({
  draft: initial,
  tagGroups,
  isNew = false,
  isComplete: _isComplete,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: ModuleDraft;
  tagGroups: TagGroup[];
  isNew?: boolean;
  isComplete: boolean;
  isSaving?: boolean;
  onSave: (d: ModuleDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<ModuleDraft>(initial);
  function update(patch: Partial<ModuleDraft>) {
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
      className="flex flex-col gap-2 rounded-sm border bg-muted/40 p-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Module Name
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
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Length (optional)
          </label>
          <div
            className="flex items-center rounded-md border border-input"
            role="group"
            aria-label="Length mode"
          >
            <Button
              type="button"
              size="sm"
              variant={draft.durationMode === "minutes" ? "secondary" : "ghost"}
              aria-pressed={draft.durationMode === "minutes"}
              onClick={() =>
                update({
                  durationMode: "minutes",
                })}
            >
              Minutes
            </Button>
            <Button
              type="button"
              size="sm"
              variant={draft.durationMode === "bucket" ? "secondary" : "ghost"}
              aria-pressed={draft.durationMode === "bucket"}
              onClick={() =>
                update({
                  durationMode: "bucket",
                })}
            >
              Range
            </Button>
          </div>
        </div>
        {draft.durationMode === "minutes"
          ? (
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.minutesValue}
              onChange={e =>
                update({
                  minutesValue: e.target.value,
                })}
              placeholder="e.g. 30"
            />
          )
          : (
            <select
              value={draft.bucketValue}
              onChange={e =>
                update({
                  bucketValue: (e.target.value || "") as
                  | ModuleDurationBucket
                  | "",
                })}
              className="
                flex h-9 w-full rounded-md border bg-background px-3 py-1
                text-sm
              "
            >
              <option value="">— Select a range —</option>
              {MODULE_DURATION_BUCKETS.map(b => (
                <option
                  key={b}
                  value={b}
                >
                  {MODULE_DURATION_LABELS[b]}
                </option>
              ))}
            </select>
          )}
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
            size="sm"
            type="submit"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Save
          </Button>
          <Button
            size="sm"
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
            <Trash2Icon className="size-3.5" />
            Remove
          </Button>
        )}
      </div>
    </form>
  );
}
