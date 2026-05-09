import type {
  InteractionDifficulty,
  InteractionProgress,
  InteractionUnderstanding,
} from "@emstack/types/src";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { createInteraction } from "@/utils/fetchFunctions";

interface Props {
  resourceId: string;
  moduleGroupId?: string | null;
  moduleId?: string | null;
  scopeLabel?: string;
  onCancel: () => void;
  onSaved?: () => void;
}

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

const PROGRESS_LABEL: Record<InteractionProgress, string> = {
  incomplete: "Incomplete",
  started: "Started",
  complete: "Complete",
};

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function InteractionQuickLog({
  resourceId,
  moduleGroupId,
  moduleId,
  scopeLabel,
  onCancel,
  onSaved,
}: Props) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayIso());
  const [progress, setProgress] = useState<InteractionProgress>("started");
  const [note, setNote] = useState("");
  const [difficulty, setDifficulty] = useState<InteractionDifficulty | "">("");
  const [understanding, setUnderstanding] = useState<
    InteractionUnderstanding | ""
  >("");

  const mutation = useMutation({
    mutationFn: () =>
      createInteraction({
        resourceId,
        moduleGroupId: moduleGroupId ?? null,
        moduleId: moduleId ?? null,
        date,
        progress,
        note: note || null,
        difficulty: difficulty || null,
        understanding: understanding || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-interactions", resourceId],
      });
      toast.success("Interaction logged");
      onSaved?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3"
    >
      {scopeLabel && (
        <p className="text-xs text-muted-foreground">
          Logging against:
          {" "}
          <span className="font-medium text-foreground">{scopeLabel}</span>
        </p>
      )}
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
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Progress
          </label>
          <select
            value={progress}
            onChange={e => setProgress(e.target.value as InteractionProgress)}
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
            value={difficulty}
            onChange={e =>
              setDifficulty(
                (e.target.value || "") as InteractionDifficulty | "",
              )}
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
            value={understanding}
            onChange={e =>
              setUnderstanding(
                (e.target.value || "") as InteractionUnderstanding | "",
              )}
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
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="What did you do? Anything notable?"
        />
      </div>
      <div className="flex flex-row gap-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="animate-spin" />}
          Log
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
