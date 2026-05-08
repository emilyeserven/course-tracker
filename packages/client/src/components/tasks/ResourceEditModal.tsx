import type { Resource, ResourceLevel } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { RESOURCE_LEVEL_OPTIONS } from "./resourceMeta";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResourceEditModalProps {
  open: boolean;
  resource: Resource | null;
  isNew?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (next: Resource) => void;
  onDelete?: () => void;
  isSaving?: boolean;
}

const NONE_VALUE = "__none";

function LevelSelect({
  value,
  onValueChange,
  ariaLabel,
}: {
  value: ResourceLevel | null | undefined;
  onValueChange: (next: ResourceLevel | null) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(v) => {
        onValueChange(v === NONE_VALUE ? null : (v as ResourceLevel));
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>—</SelectItem>
        {RESOURCE_LEVEL_OPTIONS.map(opt => (
          <SelectItem
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ResourceEditModal({
  open,
  resource,
  isNew = false,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
}: ResourceEditModalProps) {
  const [draft, setDraft] = useState<Resource | null>(resource);

  useEffect(() => {
    setDraft(resource);
  }, [resource]);

  if (!draft) {
    return null;
  }

  function update(patch: Partial<Resource>) {
    setDraft(prev => (prev
      ? {
        ...prev,
        ...patch,
      }
      : prev));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    onSave(draft);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add Resource" : "Edit Resource"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="resource-name"
            >
              Name
            </label>
            <Input
              id="resource-name"
              type="text"
              value={draft.name}
              onChange={e => update({
                name: e.target.value,
              })}
              required
              placeholder="Resource name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="resource-url"
            >
              Location (optional)
            </label>
            <Input
              id="resource-url"
              type="text"
              value={draft.url ?? ""}
              onChange={e => update({
                url: e.target.value,
              })}
              placeholder="A URL or location description"
            />
          </div>
          <div
            className="
              grid grid-cols-1 gap-3
              md:grid-cols-3
            "
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Ease of Starting
              </label>
              <LevelSelect
                value={draft.easeOfStarting}
                onValueChange={v => update({
                  easeOfStarting: v,
                })}
                ariaLabel="Ease of starting"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Time Needed
              </label>
              <LevelSelect
                value={draft.timeNeeded}
                onValueChange={v => update({
                  timeNeeded: v,
                })}
                ariaLabel="Time needed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Interactivity
              </label>
              <LevelSelect
                value={draft.interactivity}
                onValueChange={v => update({
                  interactivity: v,
                })}
                ariaLabel="Interactivity"
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.usedYet}
              onChange={e => update({
                usedYet: e.target.checked,
              })}
              className="size-4"
            />
            <span>Used yet?</span>
          </label>
          <DialogFooter className="sm:justify-between">
            {onDelete && !isNew
              ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isSaving}
                >
                  <Trash2Icon className="size-4" />
                  Remove
                </Button>
              )
              : (
                <span />
              )}
            <div
              className="
                flex flex-col-reverse gap-2
                sm:flex-row
              "
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="animate-spin" />}
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
