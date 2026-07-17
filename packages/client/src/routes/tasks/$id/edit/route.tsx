import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";

import { formSchema } from "./-components/-taskFormSchema";

import {
  Button,
  EditPageFooter,
  EntityHeaderButton,
  PageHeader,
  UnsavedChangesDialog,
} from "@/components/editPage";
import { BookmarkPicker, useAppForm } from "@/components/formFields";
import { toTodoInput } from "@/components/tasks/todoPayload";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import { useFormChangeState } from "@/hooks/useFormChangeState";
import {
  createTask,
  deleteSingleTask,
  fetchSingleTask,
  fetchTagGroups,
  fetchTaskTypes,
  queryKeys,
  tagGroupsToOptions,
  toOptions,
  upsertTask,
} from "@/utils";

export const Route = createFileRoute("/tasks/$id/edit")({
  component: SingleTaskEdit,
});

function SingleTaskEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const {
    data, shouldBlockFn, makeDeleteHandler, makeSubmitHandler,
  }
    = useEditFormPage({
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
    navigateToEntity: taskId =>
      navigate({
        to: "/tasks/$id",
        params: {
          id: taskId,
        },
      }),
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

  const taskTypeOptions = toOptions(taskTypes);

  const tagOptions = tagGroupsToOptions(tagGroups);

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      dueDate: data?.dueDate ? new Date(data.dueDate) : null,
      taskTypeId: data?.taskTypeId ?? "",
      tagIds: (data?.tags ?? []).map(t => t.id),
      bookmarks: data?.bookmarks ?? [],
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
      // Todos are edited on the detail page; preserve them untouched here.
      const existingTodos = (data?.todos ?? []).map(toTodoInput);

      // fallow-ignore-next-line code-duplication
      await submitTask({
        name: value.name,
        description: value.description || null,
        dueDate: value.dueDate
          ? value.dueDate.toISOString().split("T")[0]
          : null,
        taskTypeId: value.taskTypeId || null,
        tagIds: value.tagIds,
        bookmarks: value.bookmarks,
        todos: existingTodos,
      });
    },
  });

  const {
    isSubmitting, hasChanges,
  } = useFormChangeState(form, startingValues);

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
        pageTitle={isNew ? "New Task List" : "Edit Task List"}
        pageSection="tasks"
      >
        {!isNew && (
          <EntityHeaderButton
            to="/tasks/$id"
            params={{
              id,
            }}
            label="View Task List"
            icon={<EyeIcon />}
          />
        )}
      </PageHeader>
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-3xl flex-col gap-8"
        >
          <form.AppField name="name">
            {field => <field.InputField label="Task List Name" />}
          </form.AppField>

          <form.AppField name="dueDate">
            {field => (
              <field.DatePickerField
                label="Due Date"
                placeholder="No due date"
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

          <form.Field name="bookmarks">
            {field => (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Bookmarks</span>
                <BookmarkPicker
                  value={field.state.value}
                  onChange={next => field.handleChange(next)}
                />
              </div>
            )}
          </form.Field>

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
            deleteLabel="Delete Task List"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Task List" : "Save Changes"}
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
        <UnsavedChangesDialog shouldBlockFn={shouldBlockFn(hasChanges)} />
      </div>
    </div>
  );
}
