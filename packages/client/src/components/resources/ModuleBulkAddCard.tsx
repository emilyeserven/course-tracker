import { useMemo, useState } from "react";

import { Loader2 } from "lucide-react";

import { parseBulkModuleNames } from "./moduleDrafts";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Inline card for adding several modules to a group at once: one module name per
 * line. Only names are captured here — every other field takes its default and
 * can be filled in afterwards via the edit card or the bulk-edit table. Saving
 * is disabled until at least one non-blank line is present.
 */
export function ModuleBulkAddCard({
  isSaving = false,
  moduleLabel = "Module",
  moduleNamePlaceholder,
  onSave,
  onCancel,
}: {
  isSaving?: boolean;
  /** Per-resource label for a module (e.g. "Lesson"). */
  moduleLabel?: string;
  /** Hint (placeholder) for the name lines, from the resource's hint template. */
  moduleNamePlaceholder?: string;
  onSave: (names: string[]) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const names = useMemo(() => parseBulkModuleNames(text), [text]);
  const lowerLabel = moduleLabel.toLowerCase();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (names.length === 0) return;
        onSave(names);
      }}
      className="flex flex-col gap-2 rounded-sm border bg-muted/40 p-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          {moduleLabel} names — one per line
        </label>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          autoFocus
          placeholder={
            moduleNamePlaceholder
              ? `${moduleNamePlaceholder}\n…`
              : `e.g.\nIntroduction\nGetting set up\nFirst ${lowerLabel}`
          }
        />
      </div>
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <p className="text-xs text-muted-foreground">
          {names.length === 0
            ? `No ${lowerLabel}s yet`
            : `${names.length} ${names.length === 1 ? lowerLabel : `${lowerLabel}s`} to add`}
        </p>
        <div className="flex flex-row gap-2">
          <Button
            size="sm"
            type="submit"
            disabled={isSaving || names.length === 0}
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Add
            {names.length > 0 ? ` ${names.length}` : ""}
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
      </div>
    </form>
  );
}
