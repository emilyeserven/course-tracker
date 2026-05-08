import type { Task, TaskTodo } from "@emstack/types/src";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { upsertTask } from "@/utils";
import { uuidv4 } from "@/utils/uuid";

interface TodosChecklistProps {
  task: Task;
}

export function TodosChecklist({
  task,
}: TodosChecklistProps) {
  const queryClient = useQueryClient();
  const todos = task.todos ?? [];
  const [draft, setDraft] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");

  const buildPayload = (nextTodos: TaskTodo[]) => ({
    name: task.name,
    description: task.description ?? null,
    topicId: task.topicId ?? null,
    resources: (task.resources ?? []).map(r => ({
      id: r.id,
      name: r.name,
      url: r.url ?? null,
      easeOfStarting: r.easeOfStarting ?? null,
      timeNeeded: r.timeNeeded ?? null,
      interactivity: r.interactivity ?? null,
      usedYet: r.usedYet,
    })),
    todos: nextTodos.map(t => ({
      id: t.id,
      name: t.name,
      isComplete: t.isComplete,
      url: t.url ?? null,
    })),
  });

  const mutation = useMutation({
    mutationFn: (next: TaskTodo[]) => upsertTask(task.id, buildPayload(next)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
      ]);
    },
    onError: () => {
      toast.error("Failed to update todos.");
    },
  });

  function handleToggle(todoId: string, nextValue: boolean) {
    const next = todos.map(t =>
      t.id === todoId
        ? {
          ...t,
          isComplete: nextValue,
        }
        : t);
    mutation.mutate(next);
  }

  function handleDelete(todoId: string) {
    const next = todos.filter(t => t.id !== todoId);
    mutation.mutate(next);
  }

  function handleAdd() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next: TaskTodo[] = [
      ...todos,
      {
        id: uuidv4(),
        taskId: task.id,
        name: trimmed,
        isComplete: false,
        url: null,
        position: todos.length,
      },
    ];
    mutation.mutate(next, {
      onSuccess: () => {
        setDraft("");
      },
    });
  }

  function handleSaveLink(todoId: string) {
    const trimmed = linkDraft.trim();
    const next = todos.map(t =>
      t.id === todoId
        ? {
          ...t,
          url: trimmed || null,
        }
        : t);
    mutation.mutate(next, {
      onSuccess: () => {
        setEditingLinkId(null);
        setLinkDraft("");
      },
    });
  }

  function startEditLink(todo: TaskTodo) {
    setEditingLinkId(todo.id);
    setLinkDraft(todo.url ?? "");
  }

  function cancelEditLink() {
    setEditingLinkId(null);
    setLinkDraft("");
  }

  return (
    <div className="flex flex-col gap-3">
      {todos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No to-dos yet.</i>
        </p>
      )}
      {todos.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="
                group flex flex-col gap-2 p-2
                hover:bg-muted/40
              "
            >
              <div className="flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.isComplete}
                  disabled={mutation.isPending}
                  onChange={e => handleToggle(todo.id, e.target.checked)}
                  className="size-4"
                  aria-label={`Mark ${todo.name} as complete`}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    todo.isComplete
                    && "text-muted-foreground line-through",
                  )}
                >
                  {todo.name}
                </span>
                {todo.url
                  ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      title={todo.url}
                    >
                      <a
                        href={todo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open link for ${todo.name}`}
                      >
                        <ExternalLinkIcon className="size-3.5" />
                        Go
                      </a>
                    </Button>
                  )
                  : editingLinkId !== todo.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditLink(todo)}
                      disabled={mutation.isPending}
                      className="
                        text-muted-foreground opacity-0 transition
                        group-hover:opacity-100
                        focus-visible:opacity-100
                      "
                    >
                      <LinkIcon className="size-3.5" />
                      Add Link
                    </Button>
                  )}
                {todo.url && editingLinkId !== todo.id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEditLink(todo)}
                    disabled={mutation.isPending}
                    aria-label={`Edit link for ${todo.name}`}
                    title="Edit link"
                    className="
                      text-muted-foreground opacity-0 transition
                      group-hover:opacity-100
                      focus-visible:opacity-100
                    "
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(todo.id)}
                  disabled={mutation.isPending}
                  aria-label={`Delete ${todo.name}`}
                  title="Delete to-do"
                  className="
                    text-destructive opacity-0 transition
                    group-hover:opacity-100
                    focus-visible:opacity-100
                  "
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
              {editingLinkId === todo.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveLink(todo.id);
                  }}
                  className="flex flex-row items-center gap-2 pl-6"
                >
                  <Input
                    value={linkDraft}
                    onChange={e => setLinkDraft(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    autoFocus
                    disabled={mutation.isPending}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={mutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={cancelEditLink}
                    disabled={mutation.isPending}
                    aria-label="Cancel link edit"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex flex-row items-center gap-2"
      >
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a to-do..."
          maxLength={500}
          disabled={mutation.isPending}
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={mutation.isPending || !draft.trim()}
        >
          <PlusIcon className="size-4" />
          Add
        </Button>
      </form>
    </div>
  );
}
