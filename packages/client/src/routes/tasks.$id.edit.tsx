import { useMemo } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  createTask,
  deleteSingleTask,
  fetchSingleTask,
  fetchTagGroups,
  fetchTaskTypes,
  fetchTopics,
  formHasChanges,
  tagGroupsToOptions,
  toOptions,
  upsertTask,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export interface TaskEditSearch {
  topicId?: string;
}

export const Route = createFileRoute("/tasks/$id/edit")({
  component: SingleTaskEdit,
  validateSearch: (search: Record<string, unknown>): TaskEditSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000),
  topicId: z.string(),
  taskTypeId: z.string(),
  tagIds: z.array(z.string()),
});

function SingleTaskEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();

  const {
    data,
    shouldBlockFn,
    makeDeleteHandler,
    makeSubmitHandler,
  } = useEditFormPage({
    id,
    isNew,
    queryKey: ["task", id],
    queryFn: () => fetchSingleTask(id),
    relatedQueryKeys: [queryKeys.tasks.list()],
  });

  const submitTask = makeSubmitHandler({
    createFn: createTask,
    upsertFn: upsertTask,
    entityLabel: "task",
    navigateToEntity: taskId => navigate({
      to: "/tasks/$id",
      params: {
        id: taskId,
      },
    }),
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: taskTypes,
  } = useQuery({
    queryKey: ["taskTypes"],
    queryFn: () => fetchTaskTypes(),
  });

  const {
    data: tagGroups,
  } = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });

  const topicOptions = toOptions(topics);

  const taskTypeOptions = toOptions(taskTypes);

  const tagOptions = tagGroupsToOptions(tagGroups);

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      topicId: data?.topicId ?? (isNew ? (search.topicId ?? "") : ""),
      taskTypeId: data?.taskTypeId ?? "",
      tagIds: (data?.tags ?? []).map(t => t.id),
    }),
    [data, isNew, search.topicId],
  );

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const existingResources = (data?.resources ?? []).map(r => ({
        id: r.id,
        name: r.name,
        url: r.url ?? null,
        usedYet: r.usedYet,
        resourceId: r.resourceId ?? null,
        moduleGroupId: r.moduleGroupId ?? null,
        moduleId: r.moduleId ?? null,
      }));

      const existingTodos = (data?.todos ?? []).map(t => ({
        id: t.id,
        name: t.name,
        isComplete: t.isComplete,
        url: t.url ?? null,
      }));

      await submitTask({
        name: value.name,
        description: value.description || null,
        topicId: value.topicId || null,
        taskTypeId: value.taskTypeId || null,
        tagIds: value.tagIds,
        resources: existingResources,
        todos: existingTodos,
      });
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleTask,
    entityLabel: "task",
    navigateToList: () =>
      navigate({
        to: "/tasks",
      }),
  });

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Task" : "Edit Task"}
        pageSection="tasks"
      >
        {!isNew && (
          <Link
            to="/tasks/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Task
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="m-auto w-full max-w-[1200px] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-3xl flex-col gap-8"
        >
          <form.AppField name="name">
            {field => <field.InputField label="Task Name" />}
          </form.AppField>

          <form.AppField name="topicId">
            {field => (
              <field.ComboboxField
                label="Topic"
                options={topicOptions}
                placeholder="Search topics..."
              />
            )}
          </form.AppField>

          <form.AppField name="taskTypeId">
            {field => (
              <field.ComboboxField
                label="Task Type"
                options={taskTypeOptions}
                placeholder="Search task types..."
              />
            )}
          </form.AppField>

          <form.AppField name="tagIds">
            {field => (
              <field.MultiComboboxField
                label="Tags"
                options={tagOptions}
                placeholder="Pick tags..."
                groupByPrefix
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this task about?"
              />
            )}
          </form.AppField>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Task"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Task" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/tasks",
                  });
                }
                else {
                  navigate({
                    to: "/tasks/$id",
                    params: {
                      id,
                    },
                  });
                }
              }}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </form>
        <UnsavedChangesDialog
          shouldBlockFn={shouldBlockFn(hasChanges)}
        />
      </div>
    </div>
  );
}
