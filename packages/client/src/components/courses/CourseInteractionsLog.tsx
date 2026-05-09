import type {
  Interaction,
  InteractionDifficulty,
  InteractionProgress,
  InteractionUnderstanding,
  Module,
  ModuleGroup,
} from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  createInteraction,
  deleteSingleInteraction,
  fetchInteractions,
  fetchModuleGroups,
  fetchModules,
  upsertInteraction,
} from "@/utils/fetchFunctions";

interface Props {
  courseId: string;
}

interface Draft {
  id: string;
  date: string;
  progress: InteractionProgress;
  note: string;
  difficulty: InteractionDifficulty | "";
  understanding: InteractionUnderstanding | "";
  moduleGroupId: string;
  moduleId: string;
}

const NEW_ID = "__new__";

const PROGRESS_OPTIONS: InteractionProgress[] = [
  "incomplete",
  "started",
  "complete",
];

const DIFFICULTY_OPTIONS: InteractionDifficulty[] = ["easy", "medium", "hard"];

const UNDERSTANDING_OPTIONS: InteractionUnderstanding[] = [
  "none",
  "basic",
  "comfortable",
  "proficient",
  "mastered",
];

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function emptyDraft(): Draft {
  return {
    id: NEW_ID,
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

const PROGRESS_LABEL: Record<InteractionProgress, string> = {
  incomplete: "Incomplete",
  started: "Started",
  complete: "Complete",
};

const PROGRESS_COLOR: Record<InteractionProgress, string> = {
  incomplete: "bg-rose-100 text-rose-900 border-rose-200",
  started: "bg-amber-100 text-amber-900 border-amber-200",
  complete: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

export function CourseInteractionsLog({
  courseId,
}: Props) {
  const queryClient = useQueryClient();

  const interactionsQuery = useQuery({
    queryKey: ["course-interactions", courseId],
    queryFn: () => fetchInteractions(),
  });

  const moduleGroupsQuery = useQuery({
    queryKey: ["course-module-groups", courseId],
    queryFn: () => fetchModuleGroups(),
  });

  const modulesQuery = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: () => fetchModules(),
  });

  const allInteractions = interactionsQuery.data ?? [];
  const interactions = allInteractions.filter(i => i.courseId === courseId);

  const moduleGroups = useMemo(
    () =>
      (moduleGroupsQuery.data ?? []).filter(g => g.courseId === courseId),
    [moduleGroupsQuery.data, courseId],
  );
  const modules = useMemo(
    () => (modulesQuery.data ?? []).filter(m => m.courseId === courseId),
    [modulesQuery.data, courseId],
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["course-interactions", courseId],
    });
  }

  const upsertMutation = useMutation({
    mutationFn: (d: Draft) =>
      upsertInteraction(d.id, {
        courseId,
        moduleGroupId: d.moduleGroupId || null,
        moduleId: d.moduleId || null,
        date: d.date,
        progress: d.progress,
        note: d.note || null,
        difficulty: d.difficulty || null,
        understanding: d.understanding || null,
      }),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Interaction saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: (d: Draft) =>
      createInteraction({
        courseId,
        moduleGroupId: d.moduleGroupId || null,
        moduleId: d.moduleId || null,
        date: d.date,
        progress: d.progress,
        note: d.note || null,
        difficulty: d.difficulty || null,
        understanding: d.understanding || null,
      }),
    onSuccess: () => {
      invalidate();
      setCreating(false);
      toast.success("Interaction logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSingleInteraction(id),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Interaction deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isAnyEditing = creating || editingId !== null;

  const lastTouch = interactions[0];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Interactions</h2>
          <p className="text-sm text-muted-foreground">
            {interactions.length === 0
              ? "No interactions logged yet."
              : lastTouch
                ? `Last touch: ${lastTouch.date} · ${PROGRESS_LABEL[lastTouch.progress]}`
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
          onSave={d => createMutation.mutate(d)}
          onCancel={() => setCreating(false)}
        />
      )}

      {interactions.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border bg-background">
          {interactions.map((i) => {
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
                  onSave={d => upsertMutation.mutate(d)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => deleteMutation.mutate(i.id)}
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
                    <span
                      className={`
                        inline-flex items-center rounded-full border px-2 py-0.5
                        text-xs font-medium
                        ${PROGRESS_COLOR[i.progress]}
                      `}
                    >
                      {PROGRESS_LABEL[i.progress]}
                    </span>
                    {targetGroup && (
                      <span
                        className="
                          inline-flex items-center rounded-full border
                          border-blue-200 bg-blue-50 px-2 py-0.5 text-xs
                          text-blue-900
                        "
                      >
                        group:
                        {" "}
                        {targetGroup.name}
                      </span>
                    )}
                    {targetModule && (
                      <span
                        className="
                          inline-flex items-center rounded-full border
                          border-blue-200 bg-blue-50 px-2 py-0.5 text-xs
                          text-blue-900
                        "
                      >
                        module:
                        {" "}
                        {targetModule.name}
                      </span>
                    )}
                    {i.difficulty && (
                      <span
                        className="
                          inline-flex items-center rounded-full border
                          bg-muted/40 px-2 py-0.5 text-xs
                        "
                      >
                        difficulty:
                        {" "}
                        {i.difficulty}
                      </span>
                    )}
                    {i.understanding && (
                      <span
                        className="
                          inline-flex items-center rounded-full border
                          bg-muted/40 px-2 py-0.5 text-xs
                        "
                      >
                        understanding:
                        {" "}
                        {i.understanding}
                      </span>
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
            onChange={e => update({
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
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Difficulty (optional)
          </label>
          <select
            value={draft.difficulty}
            onChange={e =>
              update({
                difficulty: (e.target.value || "") as
                | InteractionDifficulty
                | "",
              })}
            className="
              flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
            "
          >
            <option value="">—</option>
            {DIFFICULTY_OPTIONS.map(d => (
              <option
                key={d}
                value={d}
              >
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Understanding (optional)
          </label>
          <select
            value={draft.understanding}
            onChange={e =>
              update({
                understanding: (e.target.value || "") as
                | InteractionUnderstanding
                | "",
              })}
            className="
              flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
            "
          >
            <option value="">—</option>
            {UNDERSTANDING_OPTIONS.map(u => (
              <option
                key={u}
                value={u}
              >
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Note (optional)
        </label>
        <Textarea
          value={draft.note}
          onChange={e => update({
            note: e.target.value,
          })}
          placeholder="What did you do? Anything notable?"
        />
      </div>
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-row gap-2">
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="animate-spin" />}
            Save
          </Button>
          <Button
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
            <Trash2Icon className="size-4" />
            Remove
          </Button>
        )}
      </div>
    </form>
  );
}
