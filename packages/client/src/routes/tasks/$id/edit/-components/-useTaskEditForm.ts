import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { formSchema } from "./-taskFormSchema";

import { useAppForm } from "@/components/formFields";
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

// The task edit page's data + form controller: loads the task, task types,
// and tag groups, builds the TanStack form (create or update), and wires the
// delete handler and unsaved-changes blocker. The route renders JSX from the
// returned, presentational-ready values.
export function useTaskEditForm(id: string, isNew: boolean) {
  const navigate = useNavigate();

  const {
    data, shouldBlockFn, makeDeleteHandler, makeSubmitHandler,
  }
    = useEditFormPage({
      id,
      isNew,
      queryKey: queryKeys.tasks.detail(id),
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
    queryKey: queryKeys.taskTypes.list(),
    queryFn: () => fetchTaskTypes(),
  });

  const {
    data: tagGroups,
  } = useQuery({
    queryKey: queryKeys.tagGroups.list(),
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

  return {
    form,
    isSubmitting,
    handleDelete,
    taskTypeOptions,
    tagOptions,
    // Pre-applied for UnsavedChangesDialog's shouldBlockFn prop.
    shouldBlock: shouldBlockFn(hasChanges),
  };
}
