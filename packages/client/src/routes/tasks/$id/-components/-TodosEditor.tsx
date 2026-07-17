import type { Task, TaskTodo } from "@emstack/types";

import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { TodoEditRow } from "./-TodoEditRow";
import { TodoReadRow } from "./-TodoReadRow";

import { toTodoInput } from "@/components/tasks/todoPayload";
import { Button } from "@/components/ui/button";
import { upsertTask } from "@/utils";
import { uuidv4 } from "@/utils/uuid";

interface TodosEditorProps {
  task: Task;
}

// Due-dated todos first (soonest first), then by position.
function compareTodosForDisplay(a: TaskTodo, b: TaskTodo): number {
  const ad = a.dueDate ?? "";
  const bd = b.dueDate ?? "";
  if (ad && bd && ad !== bd) return ad.localeCompare(bd);
  if (ad && !bd) return -1;
  if (!ad && bd) return 1;
  return (a.position ?? 0) - (b.position ?? 0);
}

// The To-Do editor: each todo carries a status, an optional due date, a note,
// and associated bookmarks (with optional section narrowing).
export function TodosEditor({
  task,
}: TodosEditorProps) {
  const queryClient = useQueryClient();
  const todos = useMemo(
    () => [...(task.todos ?? [])].sort(compareTodosForDisplay),
    [task.todos],
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNew, setDraftNew] = useState<TaskTodo | null>(null);

  const mutation = useMutation({
    mutationFn: (nextTodos: TaskTodo[]) =>
      upsertTask(task.id, {
        name: task.name,
        todos: nextTodos.map(toTodoInput),
      }),
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
      toast.error("Failed to update to-dos.");
    },
  });

  function saveEdit(updated: TaskTodo) {
    const next = todos.map(t => (t.id === updated.id ? updated : t));
    mutation.mutate(next, {
      onSuccess: () => setEditingId(null),
    });
  }

  function saveNew(created: TaskTodo) {
    mutation.mutate([...todos, created], {
      onSuccess: () => setDraftNew(null),
    });
  }

  function handleDelete(todoId: string) {
    mutation.mutate(
      todos.filter(t => t.id !== todoId),
      {
        onSuccess: () => setEditingId(null),
      },
    );
  }

  function cycleStatus(todo: TaskTodo) {
    // Quick toggle between incomplete and goal from the read row.
    const nextStatus = todo.status === "goal" ? "incomplete" : "goal";
    saveEdit({
      ...todo,
      status: nextStatus,
    });
  }

  function startCreate() {
    setEditingId(null);
    setDraftNew({
      id: uuidv4(),
      taskId: task.id,
      name: "",
      status: "incomplete",
      dueDate: null,
      note: null,
      location: null,
      url: null,
      position: todos.length,
      bookmarks: [],
    });
  }

  const isAnyEditing = editingId !== null || draftNew !== null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startCreate}
          disabled={isAnyEditing}
        >
          <PlusIcon className="size-4" />
          Add To-Do
        </Button>
      </div>

      {todos.length === 0 && !draftNew && (
        <p className="text-sm text-muted-foreground">
          <i>No to-dos yet.</i>
        </p>
      )}

      {(todos.length > 0 || draftNew) && (
        <ul className="flex flex-col divide-y rounded-md border bg-background">
          {draftNew && (
            <TodoEditRow
              key={draftNew.id}
              todo={draftNew}
              isNew
              isSaving={mutation.isPending}
              onSave={saveNew}
              onCancel={() => setDraftNew(null)}
            />
          )}
          {todos.map(todo =>
            todo.id === editingId
              ? (
                <TodoEditRow
                  key={todo.id}
                  todo={todo}
                  isSaving={mutation.isPending}
                  onSave={saveEdit}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(todo.id)}
                />
              )
              : (
                <TodoReadRow
                  key={todo.id}
                  todo={todo}
                  actionsDisabled={mutation.isPending || isAnyEditing}
                  onToggleStatus={() => cycleStatus(todo)}
                  onStartEdit={() => {
                    setDraftNew(null);
                    setEditingId(todo.id);
                  }}
                />
              ))}
        </ul>
      )}
    </div>
  );
}
