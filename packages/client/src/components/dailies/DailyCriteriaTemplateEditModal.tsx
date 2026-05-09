import type { DailyCriteriaTemplate } from "@emstack/types/src";

import { useEffect, useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyCriteriaTemplateEditModalProps {
  open: boolean;
  template: DailyCriteriaTemplate | null;
  isNew?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (next: DailyCriteriaTemplate) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  deleteDisabled?: boolean;
}

const FIELDS: { key: keyof Omit<DailyCriteriaTemplate, "id" | "label">;
  label: string;
  placeholder: string; }[] = [
  {
    key: "incomplete",
    label: "Incomplete",
    placeholder: "What does \"Incomplete\" mean here?",
  },
  {
    key: "touched",
    label: "Touched",
    placeholder: "What does \"Touched\" mean here?",
  },
  {
    key: "goal",
    label: "Completed (Goal)",
    placeholder: "What does \"Completed\" (goal) mean here?",
  },
  {
    key: "exceeded",
    label: "Exceeded",
    placeholder: "What does \"Exceeded\" mean here?",
  },
  {
    key: "freeze",
    label: "Freeze",
    placeholder: "What does \"Freeze\" mean here?",
  },
];

export function DailyCriteriaTemplateEditModal({
  open,
  template,
  isNew = false,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
  deleteDisabled = false,
}: DailyCriteriaTemplateEditModalProps) {
  const [draft, setDraft] = useState<DailyCriteriaTemplate | null>(template);

  useEffect(() => {
    setDraft(template);
  }, [template]);

  if (!draft) {
    return null;
  }

  function update(patch: Partial<DailyCriteriaTemplate>) {
    setDraft((prev: DailyCriteriaTemplate | null) => (prev
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
            {isNew ? "Add Criteria Template" : "Edit Criteria Template"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="criteria-template-label"
            >
              Label
            </label>
            <Input
              id="criteria-template-label"
              type="text"
              value={draft.label}
              onChange={e => update({
                label: e.target.value,
              })}
              required
              placeholder="Template label (e.g. Book Rules)"
            />
          </div>
          {FIELDS.map(f => (
            <div
              key={f.key}
              className="flex flex-col gap-1"
            >
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor={`criteria-template-${f.key}`}
              >
                {f.label}
              </label>
              <Textarea
                id={`criteria-template-${f.key}`}
                value={draft[f.key] ?? ""}
                onChange={e => update({
                  [f.key]: e.target.value,
                })}
                placeholder={f.placeholder}
                maxLength={500}
              />
            </div>
          ))}
          <DialogFooter className="sm:justify-between">
            {onDelete && !isNew
              ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isSaving || deleteDisabled}
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
