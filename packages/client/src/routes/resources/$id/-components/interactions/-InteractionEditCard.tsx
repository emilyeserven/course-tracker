import type { InteractionDraft } from "@/hooks/useInteractionsLog";
import type { InteractionProgress, Module, ModuleGroup } from "@emstack/types";

import { useState } from "react";

import { EditFormActions } from "@/components/layout/EditFormActions";
import {
  DIFFICULTY_OPTIONS,
  PROGRESS_LABEL,
  PROGRESS_OPTIONS,
  UNDERSTANDING_OPTIONS,
} from "@/components/resources/interactionMeta";
import { OptionalSelectField } from "@/components/resources/OptionalSelectField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Draft = InteractionDraft;

// The add/edit form for a manual interaction. Internal to -ResourceInteractionsLog;
// not re-exported from the folder barrel.
export function InteractionEditCard({
  draft: initial,
  moduleGroups,
  modules,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: Draft;
  moduleGroups: ModuleGroup[];
  modules: Module[];
  isNew?: boolean;
  isSaving?: boolean;
  onSave: (d: Draft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  function update(patch: Partial<Draft>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }
  const hasSubTargets = moduleGroups.length > 0 || modules.length > 0;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3"
    >
      <div
        className="
          grid grid-cols-1 gap-3
          md:grid-cols-2
        "
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            value={draft.date}
            onChange={e =>
              update({
                date: e.target.value,
              })}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Progress
          </label>
          <select
            value={draft.progress}
            onChange={e =>
              update({
                progress: e.target.value as InteractionProgress,
              })}
            className="
              flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
            "
          >
            {PROGRESS_OPTIONS.map(p => (
              <option
                key={p}
                value={p}
              >
                {PROGRESS_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {hasSubTargets && (
        <div
          className="
            grid grid-cols-1 gap-3
            md:grid-cols-2
          "
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Module Group (optional)
            </label>
            <select
              value={draft.moduleGroupId}
              onChange={(e) => {
                const next = e.target.value;
                update({
                  moduleGroupId: next,
                  ...(next
                    ? {
                      moduleId: "",
                    }
                    : {}),
                });
              }}
              className="
                flex h-9 w-full rounded-md border bg-background px-3 py-1
                text-sm
              "
            >
              <option value="">— Whole resource —</option>
              {moduleGroups.map(g => (
                <option
                  key={g.id}
                  value={g.id}
                >
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Specific Module (optional)
            </label>
            <select
              value={draft.moduleId}
              onChange={(e) => {
                const next = e.target.value;
                update({
                  moduleId: next,
                  ...(next
                    ? {
                      moduleGroupId: "",
                    }
                    : {}),
                });
              }}
              className="
                flex h-9 w-full rounded-md border bg-background px-3 py-1
                text-sm
              "
            >
              <option value="">— None —</option>
              {modules.map(m => (
                <option
                  key={m.id}
                  value={m.id}
                >
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div
        className="
          grid grid-cols-1 gap-3
          md:grid-cols-2
        "
      >
        <OptionalSelectField
          label="Difficulty (optional)"
          value={draft.difficulty}
          options={DIFFICULTY_OPTIONS}
          onValueChange={difficulty =>
            update({
              difficulty,
            })}
        />
        <OptionalSelectField
          label="Understanding (optional)"
          value={draft.understanding}
          options={UNDERSTANDING_OPTIONS}
          onValueChange={understanding =>
            update({
              understanding,
            })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Note (optional)
        </label>
        <Textarea
          value={draft.note}
          onChange={e =>
            update({
              note: e.target.value,
            })}
          placeholder="What did you do? Anything notable?"
        />
      </div>
      <EditFormActions
        isSaving={isSaving}
        onCancel={onCancel}
        onDelete={onDelete}
        isNew={isNew}
      />
    </form>
  );
}
