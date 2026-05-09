import type { DailyCriteriaTemplate, TaskType } from "@emstack/types/src";

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

import { DailyCriteriaTemplateEditModal } from "@/components/dailies";
import { PageHeader } from "@/components/layout/PageHeader";
import { TagChip } from "@/components/tasks/TagChip";
import { TagGroupsAdmin } from "@/components/TagGroupsAdmin";
import { TaskTypeEditRow } from "@/components/TaskTypeEditRow";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme.ts";
import {
  createDailyCriteriaTemplate,
  createTaskType,
  deleteSingleDailyCriteriaTemplate,
  deleteSingleTaskType,
  fetchClear,
  fetchDailyCriteriaTemplates,
  fetchSeed,
  fetchTaskTypes,
  upsertDailyCriteriaTemplate,
  upsertTaskType,
} from "@/utils";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const NEW_TASK_TYPE_ID = "__new__";
const NEW_CRITERIA_TEMPLATE_ID = "__new__";

function makeEmptyTaskType(): TaskType {
  return {
    id: NEW_TASK_TYPE_ID,
    name: "",
    whenToUse: "",
    tags: [],
  };
}

function makeEmptyCriteriaTemplate(): DailyCriteriaTemplate {
  return {
    id: NEW_CRITERIA_TEMPLATE_ID,
    label: "",
    incomplete: "",
    touched: "",
    goal: "",
    exceeded: "",
    freeze: "",
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
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [creatingNewTemplate, setCreatingNewTemplate] = useState(false);

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

  const criteriaTemplatesQuery = useQuery({
    queryKey: ["dailyCriteriaTemplates"],
    queryFn: () => fetchDailyCriteriaTemplates(),
  });

  const upsertTemplateMutation = useMutation({
    mutationFn: (template: DailyCriteriaTemplate) =>
      upsertDailyCriteriaTemplate(template.id, {
        label: template.label,
        incomplete: template.incomplete,
        touched: template.touched,
        goal: template.goal,
        exceeded: template.exceeded,
        freeze: template.freeze,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCriteriaTemplates"],
      });
      setEditingTemplateId(null);
      toast.success("Template saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: DailyCriteriaTemplate) =>
      createDailyCriteriaTemplate({
        label: template.label,
        incomplete: template.incomplete,
        touched: template.touched,
        goal: template.goal,
        exceeded: template.exceeded,
        freeze: template.freeze,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCriteriaTemplates"],
      });
      setCreatingNewTemplate(false);
      toast.success("Template created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => deleteSingleDailyCriteriaTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCriteriaTemplates"],
      });
      setEditingTemplateId(null);
      toast.success("Template deleted");
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
  const isAnyTaskTypeEditing = editingId !== null || creatingNew;

  const criteriaTemplates = criteriaTemplatesQuery.data ?? [];
  const editingCriteriaTemplate = editingTemplateId
    ? criteriaTemplates.find(t => t.id === editingTemplateId) ?? null
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
              disabled={isAnyTaskTypeEditing}
            >
              <PlusIcon />
              New Task Type
            </Button>
          </div>
          {taskTypesQuery.isPending
            ? <p className="text-sm text-muted-foreground">Loading...</p>
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
                          isSaving={upsertMutation.isPending
                            || deleteMutation.isPending}
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
                                <span
                                  className="text-xs text-muted-foreground"
                                >
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

        <TagGroupsAdmin />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">
              Dailies Status Criteria Templates
            </h2>
            <Button
              variant="outline"
              onClick={() => setCreatingNewTemplate(true)}
            >
              <PlusIcon />
              New Template
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Prefill options for the Status Criteria Quick Fill on a daily.
          </p>
          {criteriaTemplatesQuery.isPending
            ? <p className="text-sm text-muted-foreground">Loading...</p>
            : criteriaTemplates.length === 0
              ? (
                <p className="text-sm text-muted-foreground">
                  No templates yet. Create one to use it as a Quick Fill option.
                </p>
              )
              : (
                <ul className="flex flex-col divide-y rounded-md border">
                  {criteriaTemplates.map(t => (
                    <li
                      key={t.id}
                      className="
                        flex flex-wrap items-center justify-between gap-2 p-3
                      "
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{t.label}</span>
                        {t.goal && (
                          <span
                            className="
                              line-clamp-1 text-xs text-muted-foreground
                            "
                          >
                            Goal:
                            {" "}
                            {t.goal}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTemplateId(t.id)}
                        >
                          <PencilIcon className="size-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTemplateMutation.mutate(t.id)}
                          disabled={deleteTemplateMutation.isPending}
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

      <DailyCriteriaTemplateEditModal
        open={editingTemplateId !== null}
        template={editingCriteriaTemplate}
        onOpenChange={(open) => {
          if (!open) setEditingTemplateId(null);
        }}
        onSave={t => upsertTemplateMutation.mutate(t)}
        onDelete={editingCriteriaTemplate
          ? () => deleteTemplateMutation.mutate(editingCriteriaTemplate.id)
          : undefined}
        isSaving={upsertTemplateMutation.isPending
          || deleteTemplateMutation.isPending}
      />

      <DailyCriteriaTemplateEditModal
        open={creatingNewTemplate}
        template={creatingNewTemplate ? makeEmptyCriteriaTemplate() : null}
        isNew
        onOpenChange={(open) => {
          if (!open) setCreatingNewTemplate(false);
        }}
        onSave={t => createTemplateMutation.mutate(t)}
        isSaving={createTemplateMutation.isPending}
      />
    </div>
  );
}
