import type { ControlledDialogProps } from "@/components/dialogProps";
import type { DailyCriteriaTemplate } from "@emstack/types";

import { useEffect, useState } from "react";

import { EditModalFooter } from "@/components/EditModalFooter";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyCriteriaTemplateEditModalProps extends ControlledDialogProps {
  template: DailyCriteriaTemplate | null;
  isNew?: boolean;
  onSave: (next: DailyCriteriaTemplate) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  deleteDisabled?: boolean;
}

const FIELDS: {
  key: keyof Omit<DailyCriteriaTemplate, "id" | "label">;
  label: string;
  placeholder: string;
}[] = [
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
    setDraft((prev: DailyCriteriaTemplate | null) =>
      prev
        ? {
          ...prev,
          ...patch,
        }
        : prev);
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
              onChange={e =>
                update({
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
                onChange={e =>
                  update({
                    [f.key]: e.target.value,
                  })}
                placeholder={f.placeholder}
                maxLength={500}
              />
            </div>
          ))}
          <EditModalFooter
            isNew={isNew}
            isSaving={isSaving}
            deleteDisabled={deleteDisabled}
            onDelete={onDelete}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
