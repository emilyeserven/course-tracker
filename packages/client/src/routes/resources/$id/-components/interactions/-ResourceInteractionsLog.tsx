import type { InteractionDraft } from "@/hooks/useInteractionsLog";
import type { Interaction, RoutineInteraction } from "@emstack/types";

import { useState } from "react";

import { PencilIcon, PlusIcon } from "lucide-react";

import { InteractionEditCard } from "./-InteractionEditCard";
import { RoutineInteractionRow } from "./-RoutineInteractionRow";

import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import {
  PROGRESS_COLOR,
  PROGRESS_LABEL,
} from "@/components/resources/interactionMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
