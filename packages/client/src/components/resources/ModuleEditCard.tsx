import type { ModuleDraft } from "./moduleDrafts";
import type { ModuleDurationBucket, TagGroup } from "@emstack/types";

import { useState } from "react";

import {
  MODULE_DURATION_BUCKETS,
  MODULE_DURATION_LABELS,
} from "@emstack/types";

import { EditFormActions } from "@/components/EditFormActions";
import { Input } from "@/components/input";
import { LevelAndTagsFields } from "@/components/resources/LevelAndTagsFields";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";

export function ModuleEditCard({
  draft: initial,
  tagGroups,
  isNew = false,
  isComplete: _isComplete,
  isSaving = false,
  showPages = false,
  moduleLabel = "Module",
  onSave,
  onCancel,
  onDelete,
}: {
  draft: ModuleDraft;
  tagGroups: TagGroup[];
  isNew?: boolean;
  isComplete: boolean;
  isSaving?: boolean;
  /** When true (book resources), show start/end page inputs. */
  showPages?: boolean;
  /** Per-resource label for a module (e.g. "Section"). */
  moduleLabel?: string;
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
          {moduleLabel} Name
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
          {showPages ? "URL (optional)" : "Location (optional)"}
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
      {showPages && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Start page (optional)
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.pageStart}
              onChange={e =>
                update({
                  pageStart: e.target.value,
                })}
              placeholder="e.g. 42"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              End page (optional)
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.pageEnd}
              onChange={e =>
                update({
                  pageEnd: e.target.value,
                })}
              placeholder="e.g. 58"
            />
          </div>
        </div>
      )}
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
        size="sm"
        trashIconClassName="size-3.5"
      />
    </form>
  );
}
