import type { TaskType } from "@emstack/types/src";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  EraserIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  SproutIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { TagChip } from "@/components/tasks/TagChip";
import { TaskTypeEditModal } from "@/components/TaskTypeEditModal";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme.ts";
import {
  createTaskType,
  deleteSingleTaskType,
  fetchClear,
  fetchSeed,
  fetchTaskTypes,
  upsertTaskType,
} from "@/utils";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const NEW_TASK_TYPE_ID = "__new__";

function makeEmptyTaskType(): TaskType {
  return {
    id: NEW_TASK_TYPE_ID,
    name: "",
    whenToUse: "",
    tags: [],
  };
}

function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    theme, setTheme,
  } = useTheme();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const {
    isFetching: isSeedFetching,
    refetch: seedRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["seed"],
    queryFn: () => fetchSeed(),
  });

  const {
    isFetching: isClearFetching,
    refetch: clearRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["clear"],
    queryFn: () => fetchClear(),
  });

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

  async function handleClearLocal() {
    const clearRefetchResult = await clearRefetch();

    if (clearRefetchResult.status === "success") {
      navigate({
        to: "/courses",
        reloadDocument: true,
      });
    }
  }

  async function handleClearSeedLocal() {
    const seedRefetchResult = await seedRefetch();
    if (seedRefetchResult.status === "success") {
      navigate({
        to: "/courses",
        reloadDocument: true,
      });
    }
  }

  const taskTypes = taskTypesQuery.data ?? [];
  const editingTaskType = editingId
    ? taskTypes.find(t => t.id === editingId) ?? null
    : null;

  return (
    <div>
      <PageHeader pageTitle="Settings" />
      <div className="container flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Data Tools</h2>
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              onClick={() => handleClearLocal()}
              disabled={isClearFetching}
            >
              <EraserIcon />
              Clear Data
            </Button>
            <Button
              variant="outline"
              onClick={() => handleClearSeedLocal()}
              disabled={isSeedFetching}
            >
              <SproutIcon />
              Clear & Seed Data
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Task Types</h2>
            <Button
              variant="outline"
              onClick={() => setCreatingNew(true)}
            >
              <PlusIcon />
              New Task Type
            </Button>
          </div>
          {taskTypesQuery.isPending
            ? <p className="text-sm text-muted-foreground">Loading...</p>
            : taskTypes.length === 0
              ? (
                <p className="text-sm text-muted-foreground">
                  No task types yet. Create one to start tagging resources.
                </p>
              )
              : (
                <ul className="flex flex-col divide-y rounded-md border">
                  {taskTypes.map(t => (
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
                                +
                                {t.tags.length - 4}
                                {" "}
                                more
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
                        >
                          <PencilIcon className="size-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(t.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2Icon className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <div className="flex flex-col items-start gap-2">
            {theme === "dark"
              ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme("light");
                  }}
                >
                  <SunIcon />
                  Set to Light Mode
                </Button>
              )
              : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme("dark");
                  }}
                >
                  <MoonIcon />
                  Set to Dark Mode
                </Button>
              )}
          </div>
        </section>
      </div>

      <TaskTypeEditModal
        open={editingId !== null}
        taskType={editingTaskType}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
        onSave={t => upsertMutation.mutate(t)}
        onDelete={editingTaskType
          ? () => deleteMutation.mutate(editingTaskType.id)
          : undefined}
        isSaving={upsertMutation.isPending || deleteMutation.isPending}
      />

      <TaskTypeEditModal
        open={creatingNew}
        taskType={creatingNew ? makeEmptyTaskType() : null}
        isNew
        onOpenChange={(open) => {
          if (!open) setCreatingNew(false);
        }}
        onSave={t => createMutation.mutate(t)}
        isSaving={createMutation.isPending}
      />
    </div>
  );
}
