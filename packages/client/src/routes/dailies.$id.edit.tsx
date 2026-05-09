import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  Loader2,
  WandSparklesIcon,
} from "lucide-react";
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
import {
  DAILY_STATUS_OPTIONS,
  TooManyDailiesWarning,
} from "@/components/dailies";
import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import {
  createDaily,
  createProvider,
  deleteSingleDaily,
  duplicateDaily,
  fetchCourses,
  fetchDailies,
  fetchDailyCriteriaTemplates,
  fetchModuleGroups,
  fetchModules,
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
  moduleGroupId: z.string(),
  moduleId: z.string(),
  taskId: z.string(),
  status: z.enum(["active", "paused", "complete"]),
  syncValues: z.boolean(),
  criteriaIncomplete: z.string().max(500),
  criteriaTouched: z.string().max(500),
  criteriaGoal: z.string().max(500),
  criteriaExceeded: z.string().max(500),
  criteriaFreeze: z.string().max(500),
});

function SingleDailyEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    settings,
  } = useSettings();

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

  const {
    data: allModuleGroups,
  } = useQuery({
    queryKey: ["module-groups-all"],
    queryFn: () => fetchModuleGroups(),
  });

  const {
    data: allModules,
  } = useQuery({
    queryKey: ["modules-all"],
    queryFn: () => fetchModules(),
  });

  const {
    data: existingDailies,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
    enabled: isNew,
  });

  const {
    data: criteriaTemplates,
  } = useQuery({
    queryKey: ["dailyCriteriaTemplates"],
    queryFn: () => fetchDailyCriteriaTemplates(),
  });

  const activeDailiesCount
    = existingDailies?.filter(
      d => d.status !== "complete" && d.status !== "paused",
    ).length ?? 0;
  const projectedActiveCount = activeDailiesCount + 1;
  const showLimitWarning
    = isNew && projectedActiveCount >= settings.maxActiveDailies;

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

  const initialLinked = !!(
    data?.course?.id
    || data?.taskId
    || data?.task?.id
    || (isNew && search.newCourseId)
  );

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      location: data?.location ?? "",
      description: data?.description ?? "",
      courseProviderId: data?.provider?.id ?? "",
      courseId: data?.course?.id ?? (isNew && search.newCourseId
        ? search.newCourseId
        : ""),
      moduleGroupId: data?.moduleGroupId ?? "",
      moduleId: data?.moduleId ?? "",
      taskId: data?.taskId ?? data?.task?.id ?? "",
      status: (data?.status === "complete"
        ? "complete"
        : data?.status === "paused"
          ? "paused"
          : "active") as "active" | "paused" | "complete",
      syncValues: initialLinked,
      criteriaIncomplete: data?.criteria?.incomplete ?? "",
      criteriaTouched: data?.criteria?.touched ?? "",
      criteriaGoal: data?.criteria?.goal ?? "",
      criteriaExceeded: data?.criteria?.exceeded ?? "",
      criteriaFreeze: data?.criteria?.freeze ?? "",
    }),
    [data, isNew, search.newCourseId, initialLinked],
  );

  const [linkBoxCollapsed, setLinkBoxCollapsed] = useState(false);

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
      if (value.criteriaFreeze) {
        criteria.freeze = value.criteriaFreeze;
      }

      const dailyData = {
        name: value.name,
        location: value.location || null,
        description: value.description || null,
        completions: data?.completions ?? [],
        courseProviderId: value.courseProviderId || null,
        courseId: value.courseId || null,
        moduleGroupId: value.courseId ? value.moduleGroupId || null : null,
        moduleId: value.courseId ? value.moduleId || null : null,
        taskId: value.taskId || null,
        status: value.status,
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
  const syncValues = currentValues.syncValues && isLinked;

  const linkedValue = currentValues.courseId
    ? `course:${currentValues.courseId}`
    : currentValues.taskId
      ? `task:${currentValues.taskId}`
      : "";

  const setLinkedValue = (val: string | null) => {
    if (!val) {
      form.setFieldValue("courseId", "");
      form.setFieldValue("moduleGroupId", "");
      form.setFieldValue("moduleId", "");
      form.setFieldValue("taskId", "");
      form.setFieldValue("syncValues", false);
      return;
    }
    if (val.startsWith("course:")) {
      const newCourseId = val.slice("course:".length);
      if (newCourseId !== currentValues.courseId) {
        form.setFieldValue("moduleGroupId", "");
        form.setFieldValue("moduleId", "");
      }
      form.setFieldValue("courseId", newCourseId);
      form.setFieldValue("taskId", "");
    }
    else if (val.startsWith("task:")) {
      form.setFieldValue("taskId", val.slice("task:".length));
      form.setFieldValue("courseId", "");
      form.setFieldValue("moduleGroupId", "");
      form.setFieldValue("moduleId", "");
    }
  };

  const courseModuleGroups = useMemo(
    () =>
      currentValues.courseId
        ? (allModuleGroups ?? []).filter(
          g => g.courseId === currentValues.courseId,
        )
        : [],
    [allModuleGroups, currentValues.courseId],
  );

  const courseModules = useMemo(
    () =>
      currentValues.courseId
        ? (allModules ?? []).filter(
          m => m.courseId === currentValues.courseId,
        )
        : [],
    [allModules, currentValues.courseId],
  );

  // When a course is linked AND sync is on, mirror its name/url/provider into
  // the daily fields so the (hidden) inputs stay in sync with the source.
  useEffect(() => {
    if (!syncValues || !selectedCourse) {
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
    syncValues,
    selectedCourse,
    currentValues.name,
    currentValues.location,
    currentValues.courseProviderId,
    form,
  ]);

  // When a task is linked AND sync is on, mirror its name into the daily name.
  useEffect(() => {
    if (!syncValues || !selectedTask) {
      return;
    }
    if (currentValues.name !== selectedTask.name) {
      form.setFieldValue("name", selectedTask.name);
    }
  }, [syncValues, selectedTask, currentValues.name, form]);

  async function handleDelete() {
    try {
      await deleteSingleDaily(id);
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
      skipBlocker.current = true;
      await navigate({
        to: "/dailies",
      });
    }
    catch {
      toast.error("Failed to delete daily. Please try again.");
    }
  }

  async function handleDuplicate() {
    try {
      const result = await duplicateDaily(id);
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
      skipBlocker.current = true;
      await navigate({
        to: "/dailies/$id",
        params: {
          id: result.id,
        },
      });
    }
    catch {
      toast.error("Failed to duplicate daily. Please try again.");
    }
  }

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Daily" : "Edit Daily"}
        pageSection="dailies"
      >
        {showLimitWarning && (
          <TooManyDailiesWarning
            activeCount={projectedActiveCount}
            limit={settings.maxActiveDailies}
          />
        )}
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
      <div className="m-auto w-full max-w-[1200px] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-2xl flex-col gap-8"
        >
          <div
            className="flex flex-col gap-3 rounded-md border bg-card p-4"
          >
            <div className="flex flex-row items-center justify-between gap-2">
              <h2 className="text-2xl">Link this Daily</h2>
              <div className="flex shrink-0 flex-row items-center gap-2">
                <WandSparklesIcon
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={linkBoxCollapsed ? "Expand" : "Collapse"}
                  title={linkBoxCollapsed
                    ? "Show link options"
                    : "Hide link options"}
                  onClick={() => setLinkBoxCollapsed(prev => !prev)}
                >
                  {linkBoxCollapsed
                    ? <ChevronDownIcon className="size-4" />
                    : <ChevronUpIcon className="size-4" />}
                </Button>
              </div>
            </div>
            {!linkBoxCollapsed && (
              <div className="flex flex-col gap-3">
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
                          <ComboboxLabel>Resources</ComboboxLabel>
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
                {currentValues.courseId
                  && (courseModuleGroups.length > 0 || courseModules.length > 0) && (
                  <div
                    className="
                      grid grid-cols-1 gap-2
                      md:grid-cols-2
                    "
                  >
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="daily-module-group"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Module Group (optional)
                      </label>
                      <select
                        id="daily-module-group"
                        value={currentValues.moduleGroupId}
                        onChange={(e) => {
                          form.setFieldValue("moduleGroupId", e.target.value);
                          if (e.target.value) {
                            form.setFieldValue("moduleId", "");
                          }
                        }}
                        className="
                          flex h-9 w-full rounded-md border bg-background px-3
                          py-1 text-sm
                        "
                      >
                        <option value="">— Whole resource —</option>
                        {courseModuleGroups.map(g => (
                          <option
                            key={g.id}
                            value={g.id}
                          >
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="daily-module"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Specific Module (optional)
                      </label>
                      <select
                        id="daily-module"
                        value={currentValues.moduleId}
                        onChange={(e) => {
                          form.setFieldValue("moduleId", e.target.value);
                          if (e.target.value) {
                            form.setFieldValue("moduleGroupId", "");
                          }
                        }}
                        className="
                          flex h-9 w-full rounded-md border bg-background px-3
                          py-1 text-sm
                        "
                      >
                        <option value="">— None —</option>
                        {courseModules.map(m => (
                          <option
                            key={m.id}
                            value={m.id}
                          >
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <form.AppField name="syncValues">
                  {field => (
                    <label
                      className="flex flex-row items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={e => field.handleChange(e.target.checked)}
                        className="size-4"
                        disabled={!isLinked}
                      />
                      <span>
                        Sync Values
                        {" "}
                        <span className="text-muted-foreground">
                          (mirror Title, Location, and Provider from the linked
                          item)
                        </span>
                      </span>
                    </label>
                  )}
                </form.AppField>
              </div>
            )}
          </div>

          {!syncValues && (
            <form.AppField name="name">
              {field => <field.InputField label="Daily Name" />}
            </form.AppField>
          )}

          {!syncValues && (
            <form.AppField name="location">
              {field => (
                <field.InputField
                  label="Location"
                  placeholder="e.g. Spanish app, gym, journal"
                />
              )}
            </form.AppField>
          )}

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Reason"
                placeholder="Why are you doing this daily?"
              />
            )}
          </form.AppField>

          {!syncValues && (
            <form.AppField name="courseProviderId">
              {field => (
                <field.ComboboxField
                  label="Provider"
                  options={providerOptions}
                  placeholder="Search providers..."
                  create={{
                    itemLabel: "provider",
                    fields: [
                      {
                        name: "name",
                        label: "Name",
                        required: true,
                        isPrimary: true,
                      },
                      {
                        name: "url",
                        label: "URL",
                        required: true,
                        type: "url",
                        placeholder: "https://...",
                      },
                    ],
                    onCreate: async (values) => {
                      const result = await createProvider(values);
                      await queryClient.invalidateQueries({
                        queryKey: ["providers"],
                      });
                      return result.id;
                    },
                  }}
                />
              )}
            </form.AppField>
          )}

          {!isNew && (
            <form.AppField name="status">
              {field => (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Status</span>
                  <div className="flex flex-row flex-wrap gap-2">
                    {(["active", "paused", "complete"] as const).map(opt => (
                      <label
                        key={opt}
                        className={cn(
                          `
                            inline-flex cursor-pointer items-center gap-2
                            rounded-md border px-3 py-1.5 text-sm
                          `,
                          field.state.value === opt
                            ? "border-primary bg-primary/10"
                            : `
                              border-input bg-background
                              hover:bg-muted
                            `,
                        )}
                      >
                        <input
                          type="radio"
                          name="dailyStatus"
                          value={opt}
                          checked={field.state.value === opt}
                          onChange={() => field.handleChange(opt)}
                          className="size-3.5"
                        />
                        <span className="capitalize">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {field.state.value === "complete" && (
                    <p className="text-xs text-muted-foreground">
                      Marking complete locks log editing.
                    </p>
                  )}
                </div>
              )}
            </form.AppField>
          )}

          <div className="flex flex-col gap-4 rounded-md border bg-card p-4">
            <div
              className="
                flex flex-row flex-wrap items-start justify-between gap-2
              "
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl">Status Criteria</h2>
                <p className="text-sm text-muted-foreground">
                  Optional notes describing what each status means for this
                  daily.
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    <WandSparklesIcon className="size-4" />
                    Quick Fill
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(criteriaTemplates ?? []).length === 0
                    ? (
                      <DropdownMenuItem disabled>
                        No templates — add one in Settings
                      </DropdownMenuItem>
                    )
                    : (criteriaTemplates ?? []).map(template => (
                      <DropdownMenuItem
                        key={template.id}
                        onSelect={() => {
                          form.setFieldValue(
                            "criteriaIncomplete",
                            template.incomplete,
                          );
                          form.setFieldValue(
                            "criteriaTouched",
                            template.touched,
                          );
                          form.setFieldValue(
                            "criteriaGoal",
                            template.goal,
                          );
                          form.setFieldValue(
                            "criteriaExceeded",
                            template.exceeded,
                          );
                          form.setFieldValue(
                            "criteriaFreeze",
                            template.freeze,
                          );
                        }}
                      >
                        {template.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <form.AppField name="criteriaIncomplete">
              {field => (
                <field.TextareaField
                  label="Incomplete"
                  placeholder="What does &quot;Incomplete&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "incomplete")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaTouched">
              {field => (
                <field.TextareaField
                  label="Touched"
                  placeholder="What does &quot;Touched&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "touched")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaGoal">
              {field => (
                <field.TextareaField
                  label="Completed (Goal)"
                  placeholder="What does &quot;Completed&quot; (goal) mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "goal")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaExceeded">
              {field => (
                <field.TextareaField
                  label="Exceeded"
                  placeholder="What does &quot;Exceeded&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "exceeded")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaFreeze">
              {field => (
                <field.TextareaField
                  label="Freeze"
                  placeholder="What does &quot;Freeze&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "freeze")?.icon}
                />
              )}
            </form.AppField>
          </div>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Daily"
            onDuplicate={handleDuplicate}
            duplicateLabel="Duplicate Daily"
          >
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
          </EditPageFooter>
        </form>
        <UnsavedChangesDialog
          shouldBlockFn={() => hasChanges && !skipBlocker.current}
        />
      </div>
    </div>
  );
}
