import type { ModuleDraft } from "./moduleDrafts";
import type { ModuleDurationBucket, TagGroup } from "@emstack/types";

import { useState } from "react";

import {
  MODULE_DURATION_BUCKETS,
  MODULE_DURATION_LABELS,
} from "@emstack/types";

import { CardField, CardLocationAndPages, CardTextField } from "./moduleCardFields";

import { EditFormActions } from "@/components/layout/EditFormActions";
import { LevelAndTagsFields } from "@/components/resources/LevelAndTagsFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ModuleEditCard({
  draft: initial,
  tagGroups,
  isNew = false,
  isSaving = false,
  showPages = false,
  moduleLabel = "Module",
  moduleNamePlaceholder,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: ModuleDraft;
  tagGroups: TagGroup[];
  isNew?: boolean;
  isSaving?: boolean;
  /** When true (book resources), show start/end page inputs. */
  showPages?: boolean;
  /** Per-resource label for a module (e.g. "Section"). */
  moduleLabel?: string;
  /** Hint (placeholder) for the name input, from the resource's hint template. */
  moduleNamePlaceholder?: string;
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
      <CardTextField
        label={`${moduleLabel} Name`}
        value={draft.name}
        onChange={name =>
          update({
            name,
          })}
        required
        autoFocus
        placeholder={moduleNamePlaceholder || undefined}
      />
      <CardLocationAndPages
        showPages={showPages}
        url={draft.url}
        pageStart={draft.pageStart}
        pageEnd={draft.pageEnd}
        onChange={update}
      />
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
      <CardField label="Description (optional)">
        <Textarea
          value={draft.description}
          onChange={e =>
            update({
              description: e.target.value,
            })}
        />
      </CardField>
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
