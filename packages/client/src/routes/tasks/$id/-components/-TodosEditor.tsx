import type { Task, TaskTodo } from "@emstack/types";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { TodoEditRow } from "./-TodoEditRow";

import { DailyStatusCircle } from "@/components/dailies/DailyStatusCircle";
import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import { toTodoInput } from "@/components/tasks/todoPayload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchModuleGroups,
  fetchModules,
  fetchResources,
  upsertTask,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";
import { uuidv4 } from "@/utils/uuid";

interface TodosEditorProps {
  task: Task;
}

// The merged To-Do editor: each todo carries a status, an optional due date, an
// optional linked resource (with narrowing) and a note — replacing the old
// separate To-Do's checklist and Resources table.
export function TodosEditor({
  task,
}: TodosEditorProps) {
  const queryClient = useQueryClient();
  const todos = useMemo(
    () =>
      [...(task.todos ?? [])].sort((a, b) => {
        // Due-dated todos first (soonest first), then by position.
        const ad = a.dueDate ?? "";
        const bd = b.dueDate ?? "";
        if (ad && bd && ad !== bd) return ad.localeCompare(bd);
        if (ad && !bd) return -1;
        if (!ad && bd) return 1;
        return (a.position ?? 0) - (b.position ?? 0);
      }),
    [task.todos],
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNew, setDraftNew] = useState<TaskTodo | null>(null);

  const {
    data: resources,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });
  const {
    data: moduleGroups,
  } = useQuery({
    queryKey: ["module-groups-all"],
    queryFn: () => fetchModuleGroups(),
  });
  const {
    data: modules,
  } = useQuery({
    queryKey: ["modules-all"],
    queryFn: () => fetchModules(),
  });

  const resourceOptions = useMemo(
    () =>
      [...(resources ?? [])]
        .map(r => ({
          id: r.id,
          name: r.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [resources],
  );

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
    mutation.mutate(todos.filter(t => t.id !== todoId), {
      onSuccess: () => setEditingId(null),
    });
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
      resourceId: null,
      moduleGroupId: null,
      moduleId: null,
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
              resourceOptions={resourceOptions}
              moduleGroups={moduleGroups ?? []}
              modules={modules ?? []}
              isNew
              isSaving={mutation.isPending}
              onSave={saveNew}
              onCancel={() => setDraftNew(null)}
            />
          )}
          {todos.map((todo) => {
            if (todo.id === editingId) {
              return (
                <TodoEditRow
                  key={todo.id}
                  todo={todo}
                  resourceOptions={resourceOptions}
                  moduleGroups={moduleGroups ?? []}
                  modules={modules ?? []}
                  isSaving={mutation.isPending}
                  onSave={saveEdit}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(todo.id)}
                />
              );
            }
            const statusOption = getDailyStatusOption(todo.status);
            const linkedResource = todo.resource
              ?? resourceOptions.find(r => r.id === todo.resourceId)
              ?? null;
            return (
              <li
                key={todo.id}
                className="
                  group flex flex-col gap-1 p-3
                  hover:bg-muted/40
                "
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cycleStatus(todo)}
                    disabled={mutation.isPending || isAnyEditing}
                    aria-label={`Status: ${statusOption.label}. Toggle.`}
                    title={statusOption.label}
                  >
                    <DailyStatusCircle
                      status={todo.status}
                      size="sm"
                    />
                  </button>
                  <span className="text-sm font-medium">{todo.name}</span>
                  {todo.dueDate && (
                    <Badge
                      variant="outline"
                      className="bg-muted/40"
                    >
                      due {todo.dueDate}
                    </Badge>
                  )}
                  {linkedResource && (
                    <Badge
                      variant="outline"
                      className="
                        border-blue-200 bg-blue-50 text-blue-900
                        dark:border-blue-900/50 dark:bg-blue-950/40
                        dark:text-blue-200
                      "
                    >
                      {linkedResource.name}
                    </Badge>
                  )}
                  <div
                    className="
                      ml-auto flex items-center gap-1 opacity-0 transition
                      group-hover:opacity-100
                      focus-within:opacity-100
                    "
                  >
                    {todo.url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
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
                        </a>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setDraftNew(null);
                        setEditingId(todo.id);
                      }}
                      disabled={mutation.isPending || isAnyEditing}
                      aria-label={`Edit ${todo.name}`}
                    >
                      <PencilIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {todo.note && (
                  <p className="pl-6 text-sm text-muted-foreground">
                    {todo.note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
