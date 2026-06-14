import type { InteractionDraft } from "@/hooks/useInteractionsLog";
import type {
  Interaction,
  InteractionProgress,
  Module,
  ModuleGroup,
  RoutineInteraction,
} from "@emstack/types";

import { useState } from "react";

import { PencilIcon, PlusIcon } from "lucide-react";

import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import { EditFormActions } from "@/components/layout/EditFormActions";
import {
  DIFFICULTY_OPTIONS,
  PROGRESS_COLOR,
  PROGRESS_LABEL,
  PROGRESS_OPTIONS,
  UNDERSTANDING_OPTIONS,
} from "@/components/resources/interactionMeta";
import { OptionalSelectField } from "@/components/resources/OptionalSelectField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NEW_ROW_ID } from "@/constants/sentinels";
import { useInteractionsLog } from "@/hooks/useInteractionsLog";

interface Props {
  resourceId: string;
}

type Draft = InteractionDraft;

// Small local date helper; intentionally duplicated alongside InteractionQuickLog.
// fallow-ignore-next-line code-duplication
function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function emptyDraft(): Draft {
  return {
    id: NEW_ROW_ID,
    date: todayIso(),
    progress: "started",
    note: "",
    difficulty: "",
    understanding: "",
    moduleGroupId: "",
    moduleId: "",
  };
}

function fromInteraction(i: Interaction): Draft {
  return {
    id: i.id,
    date: i.date,
    progress: i.progress,
    note: i.note ?? "",
    difficulty: i.difficulty ?? "",
    understanding: i.understanding ?? "",
    moduleGroupId: i.moduleGroupId ?? "",
    moduleId: i.moduleId ?? "",
  };
}

// One row of the merged log: a manually-logged interaction (editable) or a
// derived routine completion that touched this resource (read-only).
type LogRow
  = | { source: "manual";
    date: string;
    manual: Interaction; }
    | { source: "routine";
      date: string;
      routine: RoutineInteraction; };

function touchLabel(row: LogRow): string {
  return row.source === "manual"
    ? PROGRESS_LABEL[row.manual.progress]
    : getDailyStatusOption(row.routine.status).label;
}

export function ResourceInteractionsLog({
  resourceId,
}: Props) {
  const {
    interactions,
    routineInteractions,
    moduleGroups,
    modules,
    createMutation,
    upsertMutation,
    deleteMutation,
  } = useInteractionsLog(resourceId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const isAnyEditing = creating || editingId !== null;

  // Interleave manual interactions and routine completions, newest first. Both
  // sources arrive date-desc from the server; re-sort the union to merge them.
  const merged: LogRow[] = [
    ...interactions.map(
      (i): LogRow => ({
        source: "manual",
        date: i.date,
        manual: i,
      }),
    ),
    ...routineInteractions.map(
      (r): LogRow => ({
        source: "routine",
        date: r.date,
        routine: r,
      }),
    ),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const lastTouch = merged[0];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            {merged.length === 0
              ? "No interactions logged yet."
              : lastTouch
                ? `Last touch: ${lastTouch.date} · ${touchLabel(lastTouch)}`
                : null}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={isAnyEditing}
        >
          <PlusIcon className="size-4" />
          Log Interaction
        </Button>
      </div>

      {creating && (
        <InteractionEditCard
          draft={emptyDraft()}
          moduleGroups={moduleGroups}
          modules={modules}
          isNew
          isSaving={createMutation.isPending}
          onSave={d =>
            createMutation.mutate(d, {
              onSuccess: () => setCreating(false),
            })}
          onCancel={() => setCreating(false)}
        />
      )}

      {merged.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border bg-background">
          {merged.map((row) => {
            if (row.source === "routine") {
              return (
                <RoutineInteractionRow
                  key={row.routine.id}
                  item={row.routine}
                />
              );
            }
            const i = row.manual;
            if (i.id === editingId) {
              return (
                <InteractionEditCard
                  key={i.id}
                  draft={fromInteraction(i)}
                  moduleGroups={moduleGroups}
                  modules={modules}
                  isSaving={
                    upsertMutation.isPending || deleteMutation.isPending
                  }
                  onSave={d =>
                    upsertMutation.mutate(d, {
                      onSuccess: () => setEditingId(null),
                    })}
                  onCancel={() => setEditingId(null)}
                  onDelete={() =>
                    deleteMutation.mutate(i.id, {
                      onSuccess: () => setEditingId(null),
                    })}
                />
              );
            }
            const targetGroup = i.moduleGroupId
              ? moduleGroups.find(g => g.id === i.moduleGroupId)
              : null;
            const targetModule = i.moduleId
              ? modules.find(m => m.id === i.moduleId)
              : null;
            return (
              <li
                key={i.id}
                className="flex flex-col gap-1 p-3"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{i.date}</span>
                    <Badge
                      variant="outline"
                      className={PROGRESS_COLOR[i.progress]}
                    >
                      {PROGRESS_LABEL[i.progress]}
                    </Badge>
                    {targetGroup && (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-900"
                      >
                        group: {targetGroup.name}
                      </Badge>
                    )}
                    {targetModule && (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-900"
                      >
                        module: {targetModule.name}
                      </Badge>
                    )}
                    {i.difficulty && (
                      <Badge
                        variant="outline"
                        className="bg-muted/40"
                      >
                        difficulty: {i.difficulty}
                      </Badge>
                    )}
                    {i.understanding && (
                      <Badge
                        variant="outline"
                        className="bg-muted/40"
                      >
                        understanding: {i.understanding}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(i.id)}
                    disabled={isAnyEditing}
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                </div>
                {i.note && (
                  <p className="text-sm text-muted-foreground">{i.note}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// A read-only log row for a routine completion that touched this resource. Shows
// the date, the routine, the completion status, and (when known) the specific
// scheduled action and whether it touched the resource directly or via a task.
function RoutineInteractionRow({
  item,
}: {
  item: RoutineInteraction;
}) {
  const statusOption = getDailyStatusOption(item.status);
  const showAction = item.actionLabel && item.actionLabel !== item.routineName;
  return (
    <li className="flex flex-col gap-1 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{item.date}</span>
        <Badge
          variant="outline"
          className={statusOption.pillClass}
        >
          {statusOption.label}
        </Badge>
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-900"
        >
          routine: {item.routineName}
        </Badge>
        {item.via === "task" && (
          <Badge
            variant="outline"
            className="bg-muted/40"
          >
            via task
          </Badge>
        )}
      </div>
      {showAction && (
        <p className="text-sm text-muted-foreground">{item.actionLabel}</p>
      )}
      {item.note && (
        <p className="text-sm text-muted-foreground">{item.note}</p>
      )}
    </li>
  );
}

function InteractionEditCard({
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
