import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/combobox";
import { useAppForm } from "@/components/formFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createDaily,
  fetchCourses,
  fetchProviders,
  fetchSingleDaily,
  fetchTasks,
  formHasChanges,
  upsertDaily,
} from "@/utils";

interface DailyEditSearch {
  newCourseId?: string;
}

export const Route = createFileRoute("/dailies/$id/edit")({
  component: SingleDailyEdit,
  validateSearch: (search: Record<string, unknown>): DailyEditSearch => ({
    newCourseId:
      typeof search.newCourseId === "string" && search.newCourseId
        ? search.newCourseId
        : undefined,
  }),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  location: z.string().max(255),
  description: z.string().max(500),
  courseProviderId: z.string(),
  courseId: z.string(),
  taskId: z.string(),
  isComplete: z.boolean(),
  criteriaIncomplete: z.string().max(500),
  criteriaTouched: z.string().max(500),
  criteriaGoal: z.string().max(500),
  criteriaExceeded: z.string().max(500),
});

function SingleDailyEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const skipBlocker = useRef(false);

  const {
    data,
  } = useQuery({
    queryKey: ["daily", id],
    queryFn: () => fetchSingleDaily(id),
    enabled: !isNew,
  });

  const {
    data: providers,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: courses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const {
    data: tasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const providerOptions = (providers ?? []).map(p => ({
    value: p.id,
    label: p.name,
  }));

  const linkedLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of courses ?? []) {
      m.set(`course:${c.id}`, c.name);
    }
    for (const t of tasks ?? []) {
      m.set(`task:${t.id}`, t.name);
    }
    return m;
  }, [courses, tasks]);

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      location: data?.location ?? "",
      description: data?.description ?? "",
      courseProviderId: data?.provider?.id ?? "",
      courseId: data?.course?.id ?? (isNew && search.newCourseId
        ? search.newCourseId
        : ""),
      taskId: data?.taskId ?? data?.task?.id ?? "",
      isComplete: data?.status === "complete",
      criteriaIncomplete: data?.criteria?.incomplete ?? "",
      criteriaTouched: data?.criteria?.touched ?? "",
      criteriaGoal: data?.criteria?.goal ?? "",
      criteriaExceeded: data?.criteria?.exceeded ?? "",
    }),
    [data, isNew, search.newCourseId],
  );

  const [hideLinkBox, setHideLinkBox] = useState(false);

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const criteria: Record<string, string> = {};
      if (value.criteriaIncomplete) {
        criteria.incomplete = value.criteriaIncomplete;
      }
      if (value.criteriaTouched) {
        criteria.touched = value.criteriaTouched;
      }
      if (value.criteriaGoal) {
        criteria.goal = value.criteriaGoal;
      }
      if (value.criteriaExceeded) {
        criteria.exceeded = value.criteriaExceeded;
      }

      const dailyData = {
        name: value.name,
        location: value.location || null,
        description: value.description || null,
        completions: data?.completions ?? [],
        courseProviderId: value.courseProviderId || null,
        courseId: value.courseId || null,
        taskId: value.taskId || null,
        status: value.isComplete ? "complete" : "active",
        criteria,
      };

      try {
        let dailyId: string;
        if (isNew) {
          const result = await createDaily(dailyData);
          dailyId = result.id;
        }
        else {
          await upsertDaily(id, dailyData);
          dailyId = id;
          await queryClient.invalidateQueries({
            queryKey: ["daily", id],
          });
        }

        await queryClient.invalidateQueries({
          queryKey: ["dailies"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/dailies/$id",
          params: {
            id: dailyId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create daily. Please try again."
            : "Failed to save daily. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  const selectedCourse = useMemo(
    () =>
      currentValues.courseId
        ? (courses ?? []).find(c => c.id === currentValues.courseId)
        : undefined,
    [currentValues.courseId, courses],
  );

  const selectedTask = useMemo(
    () =>
      currentValues.taskId
        ? (tasks ?? []).find(t => t.id === currentValues.taskId)
        : undefined,
    [currentValues.taskId, tasks],
  );

  const isLinked = !!(currentValues.courseId || currentValues.taskId);

  const linkedValue = currentValues.courseId
    ? `course:${currentValues.courseId}`
    : currentValues.taskId
      ? `task:${currentValues.taskId}`
      : "";

  const setLinkedValue = (val: string | null) => {
    if (!val) {
      form.setFieldValue("courseId", "");
      form.setFieldValue("taskId", "");
      return;
    }
    if (val.startsWith("course:")) {
      form.setFieldValue("courseId", val.slice("course:".length));
      form.setFieldValue("taskId", "");
    }
    else if (val.startsWith("task:")) {
      form.setFieldValue("taskId", val.slice("task:".length));
      form.setFieldValue("courseId", "");
    }
  };

  // When a course is linked, mirror its name/url/provider into the daily
  // fields so the (now-disabled) inputs stay in sync with the source.
  useEffect(() => {
    if (!selectedCourse) {
      return;
    }
    if (currentValues.name !== selectedCourse.name) {
      form.setFieldValue("name", selectedCourse.name);
    }
    const courseLocation = selectedCourse.url ?? "";
    if (currentValues.location !== courseLocation) {
      form.setFieldValue("location", courseLocation);
    }
    const courseProviderId = selectedCourse.provider?.id ?? "";
    if (currentValues.courseProviderId !== courseProviderId) {
      form.setFieldValue("courseProviderId", courseProviderId);
    }
  }, [
    selectedCourse,
    currentValues.name,
    currentValues.location,
    currentValues.courseProviderId,
    form,
  ]);

  // When a task is linked, mirror its name into the daily name field.
  useEffect(() => {
    if (!selectedTask) {
      return;
    }
    if (currentValues.name !== selectedTask.name) {
      form.setFieldValue("name", selectedTask.name);
    }
  }, [selectedTask, currentValues.name, form]);

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Daily" : "Edit Daily"}
        pageSection="dailies"
      >
        {!isNew && (
          <Link
            to="/dailies/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Daily
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="container flex-col">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-2xl flex-col gap-8"
        >
          {!hideLinkBox && (
            <div
              className="
                flex flex-row items-start justify-between gap-4 rounded-md
                border bg-card p-4
              "
            >
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h2 className="text-2xl">Link this Daily</h2>
                <Combobox
                  value={linkedValue || null}
                  onValueChange={val => setLinkedValue(val ?? null)}
                  itemToStringLabel={val => linkedLabelMap.get(val) ?? ""}
                >
                  <ComboboxInput
                    placeholder="Search courses or tasks..."
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(courses ?? []).length > 0 && (
                        <ComboboxGroup>
                          <ComboboxLabel>Courses</ComboboxLabel>
                          {(courses ?? []).map(c => (
                            <ComboboxItem
                              key={`course:${c.id}`}
                              value={`course:${c.id}`}
                            >
                              {c.name}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      )}
                      {(tasks ?? []).length > 0 && (
                        <ComboboxGroup>
                          <ComboboxLabel>Tasks</ComboboxLabel>
                          {(tasks ?? []).map(t => (
                            <ComboboxItem
                              key={`task:${t.id}`}
                              value={`task:${t.id}`}
                            >
                              {t.name}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-fit"
                  onClick={() => setHideLinkBox(true)}
                >
                  Hide This
                </Button>
              </div>
              <WandSparklesIcon
                className="size-8 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}

          <form.AppField name="name">
            {field => (
              <field.InputField
                label="Daily Name"
                disabled={isLinked}
              />
            )}
          </form.AppField>

          <form.AppField name="location">
            {field => (
              <field.InputField
                label="Location"
                placeholder="e.g. Spanish app, gym, journal"
                disabled={isLinked}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this daily about?"
              />
            )}
          </form.AppField>

          <form.AppField name="courseProviderId">
            {field => (
              <field.ComboboxField
                label="Provider"
                options={providerOptions}
                placeholder="Search providers..."
                disabled={isLinked}
              />
            )}
          </form.AppField>

          {!isNew && (
            <form.AppField name="isComplete">
              {field => (
                <label className="flex flex-row items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={e => field.handleChange(e.target.checked)}
                    className="size-4"
                  />
                  <span>Mark as completed (locks log editing)</span>
                </label>
              )}
            </form.AppField>
          )}

          <div className="flex flex-col gap-4 rounded-md border bg-card p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl">Status Criteria</h2>
              <p className="text-sm text-muted-foreground">
                Optional notes describing what each status means for this
                daily.
              </p>
            </div>
            <form.AppField name="criteriaIncomplete">
              {field => (
                <field.TextareaField
                  label="Incomplete"
                  placeholder="What does &quot;Incomplete&quot; mean here?"
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaTouched">
              {field => (
                <field.TextareaField
                  label="Touched"
                  placeholder="What does &quot;Touched&quot; mean here?"
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaGoal">
              {field => (
                <field.TextareaField
                  label="Completed (Goal)"
                  placeholder="What does &quot;Completed&quot; (goal) mean here?"
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaExceeded">
              {field => (
                <field.TextareaField
                  label="Exceeded"
                  placeholder="What does &quot;Exceeded&quot; mean here?"
                />
              )}
            </form.AppField>
          </div>

          <div className="flex flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Daily" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/dailies",
                  });
                }
                else {
                  navigate({
                    to: "/dailies/$id",
                    params: {
                      id,
                    },
                  });
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
        <UnsavedChangesDialog
          shouldBlockFn={() => hasChanges && !skipBlocker.current}
        />
      </div>
    </div>
  );
}
