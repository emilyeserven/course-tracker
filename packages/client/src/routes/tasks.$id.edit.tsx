import { useMemo, useRef } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createTask,
  deleteSingleTask,
  fetchSingleTask,
  fetchTaskTypes,
  fetchTopics,
  formHasChanges,
  upsertTask,
} from "@/utils";

export const Route = createFileRoute("/tasks/$id/edit")({
  component: SingleTaskEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000),
  topicId: z.string(),
  taskTypeId: z.string(),
});

function SingleTaskEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const skipBlocker = useRef(false);

  const {
    data,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchSingleTask(id),
    enabled: !isNew,
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

  const topicOptions = (topics ?? []).map(t => ({
    value: t.id,
    label: t.name,
  }));

  const taskTypeOptions = (taskTypes ?? []).map(t => ({
    value: t.id,
    label: t.name,
  }));

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      topicId: data?.topicId ?? "",
      taskTypeId: data?.taskTypeId ?? "",
    }),
    [data],
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
        easeOfStarting: r.easeOfStarting ?? null,
        timeNeeded: r.timeNeeded ?? null,
        interactivity: r.interactivity ?? null,
        usedYet: r.usedYet,
        tags: r.tags ?? [],
      }));

      const existingTodos = (data?.todos ?? []).map(t => ({
        id: t.id,
        name: t.name,
        isComplete: t.isComplete,
        url: t.url ?? null,
      }));

      const taskData = {
        name: value.name,
        description: value.description || null,
        topicId: value.topicId || null,
        taskTypeId: value.taskTypeId || null,
        resources: existingResources,
        todos: existingTodos,
      };

      try {
        let taskId: string;
        if (isNew) {
          const result = await createTask(taskData);
          taskId = result.id;
        }
        else {
          await upsertTask(id, taskData);
          taskId = id;
          await queryClient.invalidateQueries({
            queryKey: ["task", id],
          });
        }
        await queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/tasks/$id",
          params: {
            id: taskId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create task. Please try again."
            : "Failed to save task. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  async function handleDelete() {
    try {
      await deleteSingleTask(id);
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      skipBlocker.current = true;
      await navigate({
        to: "/tasks",
      });
    }
    catch {
      toast.error("Failed to delete task. Please try again.");
    }
  }

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
          shouldBlockFn={() => hasChanges && !skipBlocker.current}
        />
      </div>
    </div>
  );
}
