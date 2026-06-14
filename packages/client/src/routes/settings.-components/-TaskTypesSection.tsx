import type { TaskType } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { TaskTypeEditRow } from "./-TaskTypeEditRow";

import { TagChip } from "@/components/tasks/TagChip";
import { Button } from "@/components/ui/button";
import { NEW_ROW_ID } from "@/constants/sentinels";
import {
  createTaskType,
  deleteSingleTaskType,
  fetchTaskTypes,
  upsertTaskType,
} from "@/utils";

function makeEmptyTaskType(): TaskType {
  return {
    id: NEW_ROW_ID,
    name: "",
    whenToUse: "",
    tags: [],
  };
}

export function TaskTypesSection() {
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const taskTypesQuery = useQuery({
    queryKey: ["taskTypes"],
    queryFn: () => fetchTaskTypes(),
  });

  const upsertMutation = useMutation({
    mutationFn: (taskType: TaskType) =>
      upsertTaskType(taskType.id, {
        name: taskType.name,
        whenToUse: taskType.whenToUse ?? null,
        tags: taskType.tags ?? [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["taskTypes"],
      });
      setEditingId(null);
      toast.success("Task type saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const createMutation = useMutation({
    mutationFn: (taskType: TaskType) =>
      createTaskType({
        name: taskType.name,
        whenToUse: taskType.whenToUse ?? null,
        tags: taskType.tags ?? [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["taskTypes"],
      });
      setCreatingNew(false);
      toast.success("Task type created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSingleTaskType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["taskTypes"],
      });
      setEditingId(null);
      toast.success("Task type deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const taskTypes = taskTypesQuery.data ?? [];
  const editingTaskType = editingId
    ? (taskTypes.find(t => t.id === editingId) ?? null)
    : null;
  const isAnyTaskTypeEditing = editingId !== null || creatingNew;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Task Types</h2>
        <Button
          variant="outline"
          onClick={() => setCreatingNew(true)}
          disabled={isAnyTaskTypeEditing}
        >
          <PlusIcon />
          New Task Type
        </Button>
      </div>
      {taskTypesQuery.isPending
        ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )
        : taskTypes.length === 0 && !creatingNew
          ? (
            <p className="text-sm text-muted-foreground">
              No task types yet. Create one to start tagging resources.
            </p>
          )
          : (
            <ul className="flex flex-col divide-y rounded-md border">
              {creatingNew && (
                <TaskTypeEditRow
                  taskType={makeEmptyTaskType()}
                  isNew
                  isSaving={createMutation.isPending}
                  onSave={t => createMutation.mutate(t)}
                  onCancel={() => setCreatingNew(false)}
                />
              )}
              {taskTypes.map((t) => {
                if (t.id === editingId && editingTaskType) {
                  return (
                    <TaskTypeEditRow
                      key={t.id}
                      taskType={editingTaskType}
                      isSaving={
                        upsertMutation.isPending || deleteMutation.isPending
                      }
                      onSave={next => upsertMutation.mutate(next)}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => deleteMutation.mutate(t.id)}
                    />
                  );
                }
                return (
                  <li
                    key={t.id}
                    className="
                      flex flex-wrap items-center justify-between gap-2 p-3
                    "
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{t.name}</span>
                      {t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {t.tags.slice(0, 4).map(tag => (
                            <TagChip
                              key={tag}
                              tag={tag}
                            />
                          ))}
                          {t.tags.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{t.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(t.id)}
                        disabled={isAnyTaskTypeEditing}
                      >
                        <PencilIcon className="size-4" />
                        Edit
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
    </section>
  );
}
